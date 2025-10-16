import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  beforeLoad: () => {
    return;
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-main/5 to-secondary-background/20">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="rounded-lg border-2 border-border bg-white p-8 shadow-lg sm:p-12">
          <div className="max-w-none">
            <h1 className="mb-4 text-center font-bold text-4xl text-foreground">
              Privacy Policy for Remembr
            </h1>

            <p className="mb-12 text-center text-muted-foreground text-sm">
              <strong>Last Updated: October 15, 2025</strong>
            </p>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Introduction
              </h2>
              <p className="text-foreground/80 text-lg leading-relaxed">
                Remembr ("we", "our", or "us") operates the website
                remembr.reda.sh. This Privacy Policy explains how we collect,
                use, and protect your personal information when you use our
                spaced repetition learning service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Information We Collect
              </h2>

              <div className="mb-6 rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 font-medium text-foreground text-xl">
                  Information from Google Authentication
                </h3>
                <p className="mb-4 text-foreground/80 text-lg">
                  When you sign in with Google, we collect:
                </p>
                <ul className="mb-4 ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                  <li>Your email address</li>
                  <li>Your name</li>
                  <li>Your Google profile picture (optional)</li>
                </ul>
              </div>

              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 font-medium text-foreground text-xl">
                  Information You Provide
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                  <li>Flashcards you create (questions and answers)</li>
                  <li>Deck names and organization</li>
                  <li>Study session data and progress</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                How We Use Your Information
              </h2>
              <p className="mb-4 text-foreground/80 text-lg">
                We use your information to:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                <li>
                  Authenticate your account and provide access to our service
                </li>
                <li>Store and organize your flashcards and study materials</li>
                <li>Track your learning progress and schedule reviews</li>
                <li>Improve our service and user experience</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Data Storage and Security
              </h2>
              <ul className="ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                <li>
                  Your data is stored securely using Convex database services
                </li>
                <li>
                  We use industry-standard security measures to protect your
                  information
                </li>
                <li>
                  Your flashcard content is private and only accessible to you
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Data Sharing
              </h2>

              <div className="mb-6 rounded-lg bg-red-50 p-6">
                <h3 className="mb-4 font-medium text-foreground text-xl">
                  We do NOT:
                </h3>
                <ul className="mb-4 ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                  <li>Sell your personal information to third parties</li>
                  <li>Share your flashcard content with anyone</li>
                  <li>Use your data for advertising purposes</li>
                </ul>
              </div>

              <div className="rounded-lg bg-green-50 p-6">
                <h3 className="mb-4 font-medium text-foreground text-xl">
                  We only share data when:
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                  <li>Required by law or legal process</li>
                  <li>Necessary to protect our rights or safety</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Your Google Data
              </h2>
              <p className="mb-4 text-foreground/80 text-lg">
                We access the following Google user data:
              </p>
              <ul className="mb-6 ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                <li>
                  <strong>Email address</strong>: Used for account creation and
                  authentication
                </li>
                <li>
                  <strong>Profile information</strong>: Used to personalize your
                  experience
                </li>
              </ul>
              <p className="text-foreground/80 text-lg">
                We do not access, use, process, or share any other Google user
                data.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Your Rights
              </h2>
              <p className="mb-4 text-foreground/80 text-lg">
                You have the right to:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                <li>Access your personal data</li>
                <li>Delete your account and all associated data</li>
                <li>Export your flashcard data</li>
                <li>Opt out of communications</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Data Retention and Deletion
              </h2>
              <ul className="ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                <li>We retain your data as long as your account is active</li>
                <li>
                  You can delete your account at any time by contacting us
                </li>
                <li>
                  Upon account deletion, all your data will be permanently
                  removed within 30 days
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Children's Privacy
              </h2>
              <p className="text-foreground/80 text-lg">
                Our service is not intended for users under 13 years of age. We
                do not knowingly collect information from children under 13.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Changes to This Policy
              </h2>
              <p className="text-foreground/80 text-lg">
                We may update this Privacy Policy from time to time. We will
                notify you of significant changes by posting the new policy on
                this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Contact Us
              </h2>
              <p className="mb-4 text-foreground/80 text-lg">
                If you have questions about this Privacy Policy or want to
                exercise your data rights, please contact us at:
              </p>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-foreground/80 text-lg">
                  <strong>Email</strong>: tarzaltreda@gmail.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-6 border-main border-b-2 pb-2 font-semibold text-3xl text-foreground">
                Compliance
              </h2>
              <p className="mb-4 text-foreground/80 text-lg">
                This privacy policy complies with:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-2 text-foreground/80 text-lg">
                <li>Google API Services User Data Policy</li>
                <li>General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
