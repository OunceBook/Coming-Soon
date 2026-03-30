import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | OunceBook",
  description: "Privacy notice for the OunceBook waitlist.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16 sm:px-10">
      <div className="mb-10 flex items-center justify-between border-b border-divider pb-4">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Privacy Policy</h1>
        <Link className="link-soft text-sm" href="/">
          Back to home
        </Link>
      </div>

      <div className="space-y-8 text-sm leading-7 text-ink/90 sm:text-base">
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-ink">What we collect</h2>
          <p>
            When you join the waitlist, we collect your email plus limited
            campaign metadata such as UTM parameters and referring page.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl text-ink">Why we collect it</h2>
          <p>
            We use this information only to manage the OunceBook waitlist and
            send relevant launch updates.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl text-ink">Data rights</h2>
          <p>
            You can request removal of your waitlist data at any time by
            emailing hello@ouncebook.com from the same address you registered.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl text-ink">Contact</h2>
          <p>
            For privacy questions, contact{" "}
            <a className="link-soft" href="mailto:hello@ouncebook.com">
              hello@ouncebook.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
