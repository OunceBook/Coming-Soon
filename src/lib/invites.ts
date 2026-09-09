import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import {
  getInvitationCollection,
  getSuppressionCollection,
  getWaitlistCollection,
} from "@/lib/mongodb";
import { sendInvitationEmail, sendNamedYouEmail } from "@/lib/smtp";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ouncebook.com"
).replace(/\/$/, "");

function unsubscribeSecret() {
  return (
    process.env.UNSUBSCRIBE_SECRET ??
    process.env.VERIFICATION_TOKEN_SALT ??
    process.env.IP_HASH_SALT ??
    "ouncebook-unsubscribe-salt"
  );
}

export function signUnsubscribeToken(email: string) {
  return createHmac("sha256", unsubscribeSecret())
    .update(email.toLowerCase())
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = signUnsubscribeToken(email);

  // Compare digests so length differences cannot throw and lengths always match.
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(token).digest();

  return timingSafeEqual(a, b);
}

export function buildUnsubscribeUrl(email: string) {
  const params = new URLSearchParams({
    email,
    token: signUnsubscribeToken(email),
  });

  return `${SITE_URL}/api/invites/unsubscribe?${params.toString()}`;
}

/**
 * Acts on the invitations a member recorded at signup.
 *
 * Called only after that member verifies their own address. That ordering is
 * the whole safety model: without it, anyone could make this server email
 * arbitrary addresses, which is both an abuse vector and the fastest way to get
 * the sending domain blocklisted — taking the verification emails down with it.
 *
 * Failures are logged and swallowed. A member's own signup must never fail
 * because notifying someone else did.
 */
export async function dispatchInvitationsFor(inviterEmail: string) {
  const inviter = inviterEmail.toLowerCase();

  try {
    const [invitations, waitlist, suppressions] = await Promise.all([
      getInvitationCollection(),
      getWaitlistCollection(),
      getSuppressionCollection(),
    ]);

    const pending = await invitations
      .find({ inviterEmail: inviter, status: "pending" })
      .toArray();

    for (const invitation of pending) {
      const invitee = invitation.inviteeEmail;

      try {
        if (await suppressions.findOne({ email: invitee })) {
          await invitations.updateOne(
            { _id: invitation._id },
            { $set: { status: "skipped", notifiedAt: new Date() } },
          );
          continue;
        }

        const [inviteeEntry, reciprocal] = await Promise.all([
          waitlist.findOne({ email: invitee }),
          invitations.findOne({
            inviterEmail: invitee,
            inviteeEmail: inviter,
          }),
        ]);

        const mutual = Boolean(reciprocal);

        if (inviteeEntry) {
          await sendNamedYouEmail({
            to: invitee,
            inviterEmail: inviter,
            mutual,
          });

          if (mutual) {
            // Both sides consented by naming each other, so both get told.
            await sendNamedYouEmail({
              to: inviter,
              inviterEmail: invitee,
              mutual: true,
            });
          }
        } else {
          await sendInvitationEmail({
            to: invitee,
            inviterEmail: inviter,
            unsubscribeUrl: buildUnsubscribeUrl(invitee),
          });
        }

        await invitations.updateOne(
          { _id: invitation._id },
          { $set: { status: "sent", notifiedAt: new Date(), mutual } },
        );
      } catch (error) {
        console.error("Invitation dispatch failed", { invitee }, error);
      }
    }
  } catch (error) {
    console.error("Invitation dispatch batch failed", error);
  }
}
