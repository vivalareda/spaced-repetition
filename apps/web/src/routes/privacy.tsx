import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/privacy")({
  beforeLoad: () => {
    return;
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useTranslation();

  const p = t;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-main/5 to-secondary-background/20">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-5xl text-foreground">
              {p("privacy.title")}
            </h1>
            <p className="text-muted-foreground">{p("privacy.lastUpdated")}</p>
          </div>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.introduction.title")}
            </h2>
            <p className="leading-relaxed text-foreground/80">
              {p("privacy.introduction.content")}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.informationWeCollect.title")}
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-main/10 bg-main/5 p-6">
                <h3 className="mb-3 font-semibold text-foreground">
                  {p("privacy.informationWeCollect.googleAuth.title")}
                </h3>
                <p className="mb-3 text-foreground/80">
                  {p("privacy.informationWeCollect.googleAuth.description")}
                </p>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>
                      {p("privacy.informationWeCollect.googleAuth.email")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>
                      {p("privacy.informationWeCollect.googleAuth.name")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>
                      {p("privacy.informationWeCollect.googleAuth.picture")}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-main/10 bg-main/5 p-6">
                <h3 className="mb-3 font-semibold text-foreground">
                  {p("privacy.informationWeCollect.youProvide.title")}
                </h3>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>
                      {p("privacy.informationWeCollect.youProvide.flashcards")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>
                      {p("privacy.informationWeCollect.youProvide.deckNames")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                    <span>
                      {p("privacy.informationWeCollect.youProvide.studyData")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.howWeUse.title")}
            </h2>
            <p className="text-foreground/80">{p("privacy.howWeUse.intro")}</p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.howWeUse.authenticate")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.howWeUse.store")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.howWeUse.track")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.howWeUse.improve")}</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.dataSecurity.title")}
            </h2>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.dataSecurity.storage")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.dataSecurity.measures")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.dataSecurity.privacy")}</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.dataSharing.title")}
            </h2>

            <div className="rounded-lg border border-red-200 bg-red-50/50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-red-900">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                {p("privacy.dataSharing.doNot")}
              </h3>
              <ul className="space-y-2 text-red-900/80">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{p("privacy.dataSharing.doNotSell")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{p("privacy.dataSharing.doNotShare")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{p("privacy.dataSharing.doNotAds")}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50/50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                {p("privacy.dataSharing.onlyWhen")}
              </h3>
              <ul className="space-y-2 text-green-900/80">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span>{p("privacy.dataSharing.byLaw")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span>{p("privacy.dataSharing.protect")}</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.googleData.title")}
            </h2>
            <p className="text-foreground/80">
              {p("privacy.googleData.intro")}
            </p>
            <ul className="space-y-3 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Email address</strong>:{" "}
                  {p("privacy.googleData.emailDesc")}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <div>
                  <strong className="text-foreground">
                    Profile information
                  </strong>
                  : {p("privacy.googleData.profileDesc")}
                </div>
              </li>
            </ul>
            <p className="text-foreground/80">{p("privacy.googleData.note")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.rights.title")}
            </h2>
            <p className="text-foreground/80">{p("privacy.rights.intro")}</p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.rights.access")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.rights.delete")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.rights.export")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.rights.optOut")}</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.retention.title")}
            </h2>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.retention.retain")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.retention.contact")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.retention.deletion")}</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.childrenPrivacy.title")}
            </h2>
            <p className="text-foreground/80">
              {p("privacy.childrenPrivacy.content")}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.changes.title")}
            </h2>
            <p className="text-foreground/80">{p("privacy.changes.content")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.contactUs.title")}
            </h2>
            <p className="text-foreground/80">{p("privacy.contactUs.intro")}</p>
            <div className="rounded-lg border border-main/20 bg-main/5 p-4">
              <p className="text-foreground/80">
                <strong className="text-foreground">
                  {p("privacy.contactUs.email")}
                </strong>
                : tarzaltreda@gmail.com
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b-2 border-main pb-3 font-bold text-2xl text-foreground">
              {p("privacy.compliance.title")}
            </h2>
            <p className="text-foreground/80">
              {p("privacy.compliance.intro")}
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.compliance.google")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.compliance.gdpr")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-main flex-shrink-0" />
                <span>{p("privacy.compliance.ccpa")}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
