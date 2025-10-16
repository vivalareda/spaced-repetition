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
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-5xl text-foreground">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last Updated: October 15, 2025
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Introduction
            </h2>
            <p className="leading-relaxed text-foreground/80">
              Remembr ("we", "our", or "us") operates the website
              remembr.reda.sh. This Privacy Policy explains how we collect, use,
              and protect your personal information when you use our spaced
              repetition learning service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-main/10 bg-main/5 p-6">
                <h3 className="mb-3 font-semibold text-foreground">
                  Information from Google Authentication
                </h3>
                <p className="mb-3 text-foreground/80">
                  When you sign in with Google, we collect:
                </p>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>Your email address</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>Your name</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>Your Google profile picture (optional)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-main/10 bg-main/5 p-6">
                <h3 className="mb-3 font-semibold text-foreground">
                  Information You Provide
                </h3>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>Flashcards you create (questions and answers)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>Deck names and organization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>Study session data and progress</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              How We Use Your Information
            </h2>
            <p className="text-foreground/80">We use your information to:</p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  Authenticate your account and provide access to our service
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  Store and organize your flashcards and study materials
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>Track your learning progress and schedule reviews</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>Improve our service and user experience</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Data Storage and Security
            </h2>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  Your data is stored securely using Convex database services
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  We use industry-standard security measures to protect your
                  information
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  Your flashcard content is private and only accessible to you
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Data Sharing
            </h2>

            <div className="rounded-lg border border-red-200 bg-red-50/50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-red-900">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                We do NOT
              </h3>
              <ul className="space-y-2 text-red-900/80">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span>Sell your personal information to third parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span>Share your flashcard content with anyone</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span>Use your data for advertising purposes</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50/50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                We only share data when
              </h3>
              <ul className="space-y-2 text-green-900/80">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span>Required by law or legal process</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span>Necessary to protect our rights or safety</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Your Google Data
            </h2>
            <p className="text-foreground/80">
              We access the following Google user data:
            </p>
            <ul className="space-y-3 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Email address</strong>:
                  Used for account creation and authentication
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <div>
                  <strong className="text-foreground">
                    Profile information
                  </strong>
                  : Used to personalize your experience
                </div>
              </li>
            </ul>
            <p className="text-foreground/80">
              We do not access, use, process, or share any other Google user
              data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Your Rights
            </h2>
            <p className="text-foreground/80">You have the right to:</p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>Access your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>Delete your account and all associated data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>Export your flashcard data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>Opt out of communications</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Data Retention and Deletion
            </h2>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  We retain your data as long as your account is active
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  You can delete your account at any time by contacting us
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>
                  Upon account deletion, all your data will be permanently
                  removed within 30 days
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Children's Privacy
            </h2>
            <p className="text-foreground/80">
              Our service is not intended for users under 13 years of age. We do
              not knowingly collect information from children under 13.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Changes to This Policy
            </h2>
            <p className="text-foreground/80">
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes by posting the new policy on
              this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Contact Us
            </h2>
            <p className="text-foreground/80">
              If you have questions about this Privacy Policy or want to
              exercise your data rights, please contact us at:
            </p>
            <div className="rounded-lg border border-main/20 bg-main/5 p-4">
              <p className="text-foreground/80">
                <strong className="text-foreground">Email</strong>:
                tarzaltreda@gmail.com
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              Compliance
            </h2>
            <p className="text-foreground/80">
              This privacy policy complies with:
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>Google API Services User Data Policy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>General Data Protection Regulation (GDPR)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>California Consumer Privacy Act (CCPA)</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
