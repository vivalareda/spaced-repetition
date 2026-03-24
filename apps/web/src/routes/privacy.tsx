import { createFileRoute } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function BulletItem({
  children,
  color = "bg-main",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full ${color}`}
      />
      <span>{children}</span>
    </li>
  );
}

function PrivacySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="border-main border-b-2 pb-3 font-bold text-2xl text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({
  items,
  color = "bg-main",
}: {
  items: string[];
  color?: string;
}) {
  return (
    <ul className="space-y-2 text-foreground/80">
      {items.map((item) => (
        <BulletItem color={color} key={item}>
          {item}
        </BulletItem>
      ))}
    </ul>
  );
}

function InformationWeCollectSection({ t }: { t: TFunction }) {
  return (
    <PrivacySection title={t("privacy.informationWeCollect.title")}>
      <div className="space-y-4">
        <div className="rounded-lg border border-main/10 bg-main/5 p-6">
          <h3 className="mb-3 font-semibold text-foreground">
            {t("privacy.informationWeCollect.googleAuth.title")}
          </h3>
          <p className="mb-3 text-foreground/80">
            {t("privacy.informationWeCollect.googleAuth.description")}
          </p>
          <BulletList
            items={[
              t("privacy.informationWeCollect.googleAuth.email"),
              t("privacy.informationWeCollect.googleAuth.name"),
              t("privacy.informationWeCollect.googleAuth.picture"),
            ]}
          />
        </div>

        <div className="rounded-lg border border-main/10 bg-main/5 p-6">
          <h3 className="mb-3 font-semibold text-foreground">
            {t("privacy.informationWeCollect.youProvide.title")}
          </h3>
          <BulletList
            items={[
              t("privacy.informationWeCollect.youProvide.flashcards"),
              t("privacy.informationWeCollect.youProvide.deckNames"),
              t("privacy.informationWeCollect.youProvide.studyData"),
            ]}
          />
        </div>
      </div>
    </PrivacySection>
  );
}

function DataSharingSection({ t }: { t: TFunction }) {
  return (
    <PrivacySection title={t("privacy.dataSharing.title")}>
      <div className="rounded-lg border border-red-200 bg-red-50/50 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-red-900">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          {t("privacy.dataSharing.doNot")}
        </h3>
        <BulletList
          color="bg-red-500"
          items={[
            t("privacy.dataSharing.doNotSell"),
            t("privacy.dataSharing.doNotShare"),
            t("privacy.dataSharing.doNotAds"),
          ]}
        />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50/50 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          {t("privacy.dataSharing.onlyWhen")}
        </h3>
        <BulletList
          color="bg-green-500"
          items={[
            t("privacy.dataSharing.byLaw"),
            t("privacy.dataSharing.protect"),
          ]}
        />
      </div>
    </PrivacySection>
  );
}

function GoogleDataSection({ t }: { t: TFunction }) {
  return (
    <PrivacySection title={t("privacy.googleData.title")}>
      <p className="text-foreground/80">{t("privacy.googleData.intro")}</p>
      <ul className="space-y-3 text-foreground/80">
        <BulletItem>
          <div>
            <strong className="text-foreground">Email address</strong>:{" "}
            {t("privacy.googleData.emailDesc")}
          </div>
        </BulletItem>
        <BulletItem>
          <div>
            <strong className="text-foreground">Profile information</strong>:{" "}
            {t("privacy.googleData.profileDesc")}
          </div>
        </BulletItem>
      </ul>
      <p className="text-foreground/80">{t("privacy.googleData.note")}</p>
    </PrivacySection>
  );
}

function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-main/5 to-secondary-background/20">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-5xl text-foreground">
              {t("privacy.title")}
            </h1>
            <p className="text-muted-foreground">{t("privacy.lastUpdated")}</p>
          </div>

          <PrivacySection title={t("privacy.introduction.title")}>
            <p className="text-foreground/80 leading-relaxed">
              {t("privacy.introduction.content")}
            </p>
          </PrivacySection>

          <InformationWeCollectSection t={t} />

          <PrivacySection title={t("privacy.howWeUse.title")}>
            <p className="text-foreground/80">{t("privacy.howWeUse.intro")}</p>
            <BulletList
              items={[
                t("privacy.howWeUse.authenticate"),
                t("privacy.howWeUse.store"),
                t("privacy.howWeUse.track"),
                t("privacy.howWeUse.improve"),
              ]}
            />
          </PrivacySection>

          <PrivacySection title={t("privacy.dataSecurity.title")}>
            <BulletList
              items={[
                t("privacy.dataSecurity.storage"),
                t("privacy.dataSecurity.measures"),
                t("privacy.dataSecurity.privacy"),
              ]}
            />
          </PrivacySection>

          <DataSharingSection t={t} />

          <GoogleDataSection t={t} />

          <PrivacySection title={t("privacy.rights.title")}>
            <p className="text-foreground/80">{t("privacy.rights.intro")}</p>
            <BulletList
              items={[
                t("privacy.rights.access"),
                t("privacy.rights.delete"),
                t("privacy.rights.export"),
                t("privacy.rights.optOut"),
              ]}
            />
          </PrivacySection>

          <PrivacySection title={t("privacy.retention.title")}>
            <BulletList
              items={[
                t("privacy.retention.retain"),
                t("privacy.retention.contact"),
                t("privacy.retention.deletion"),
              ]}
            />
          </PrivacySection>

          <PrivacySection title={t("privacy.childrenPrivacy.title")}>
            <p className="text-foreground/80">
              {t("privacy.childrenPrivacy.content")}
            </p>
          </PrivacySection>

          <PrivacySection title={t("privacy.changes.title")}>
            <p className="text-foreground/80">{t("privacy.changes.content")}</p>
          </PrivacySection>

          <PrivacySection title={t("privacy.contactUs.title")}>
            <p className="text-foreground/80">{t("privacy.contactUs.intro")}</p>
            <div className="rounded-lg border border-main/20 bg-main/5 p-4">
              <p className="text-foreground/80">
                <strong className="text-foreground">
                  {t("privacy.contactUs.email")}
                </strong>
                : tarzaltreda@gmail.com
              </p>
            </div>
          </PrivacySection>

          <PrivacySection title={t("privacy.compliance.title")}>
            <p className="text-foreground/80">
              {t("privacy.compliance.intro")}
            </p>
            <BulletList
              items={[
                t("privacy.compliance.google"),
                t("privacy.compliance.gdpr"),
                t("privacy.compliance.ccpa"),
              ]}
            />
          </PrivacySection>
        </div>
      </div>
    </div>
  );
}
