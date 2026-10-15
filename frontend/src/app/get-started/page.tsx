import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LandingLogo } from "@/components/landing/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export default async function GetStartedPage() {
  const t = await getTranslations("getStarted");
  const tRegister = await getTranslations("auth.register");

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <LandingLogo href="/" size="md" />

        <nav className="flex items-center gap-4 md:gap-7">
          <Link
            href="/help"
            className="hidden md:inline text-sm font-semibold text-muted hover:text-green"
          >
            {t("help")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 py-10 md:px-10 md:py-16">
        <div className="w-full max-w-[400px] md:max-w-4xl flex flex-col items-center">
          {/* Intro */}
          <section className="w-full text-center flex flex-col items-center mb-10 md:mb-12">
            <div className="hidden md:block uppercase tracking-widest text-[11px] font-bold text-gold mb-3">
              {t("eyebrow")}
            </div>

            <h1 className="font-serif text-[28px] leading-tight text-primary md:text-[48px] md:leading-[1.1]">
              {t("title")}
            </h1>

            <p className="mt-3 md:mt-4 text-base leading-6 text-muted max-w-[300px] md:max-w-lg">
              {t("subtitle")}
            </p>
          </section>

          {/* Options */}
          <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* For Myself */}
            <Link
              href="/register"
              className="option-card w-full text-start bg-white border border-outline-variant rounded-xl p-4 md:p-8 flex flex-col min-h-[250px] md:min-h-[300px] hover:border-green hover:shadow-sm transition-all duration-180 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container rounded flex items-center justify-center text-primary mb-4 md:mb-6">
                <span className="text-xl">👤</span>
              </div>
              <h2 className="font-serif text-[22px] md:text-[28px] leading-tight text-primary mb-3">
                {t("forMyself")}
              </h2>
              <p className="text-base leading-6 text-muted mb-6 md:mb-8 flex-1">
                {t("forMyselfBody")}
              </p>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green group-hover:text-primary">
                {t("choose")}
                →
              </span>
            </Link>

            {/* For Family */}
            <Link
              href="/register"
              className="option-card w-full text-start bg-white border-2 border-green rounded-xl p-4 md:p-8 flex flex-col min-h-[250px] md:min-h-[300px] hover:bg-surface-low hover:shadow-sm transition-all duration-180 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green/10 rounded flex items-center justify-center text-green mb-4 md:mb-6">
                <span className="text-xl">👨‍👩‍👧‍👦</span>
              </div>
              <h2 className="font-serif text-[22px] md:text-[28px] leading-tight text-primary mb-3">
                {t("forFamily")}
              </h2>
              <p className="text-base leading-6 text-muted mb-6 md:mb-8 flex-1">
                {t("forFamilyBody")}
              </p>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green">
                {t("choose")}
                →
              </span>
            </Link>
          </section>

          {/* Login */}
          <div className="mt-8 md:mt-12 text-center text-base text-muted">
            {tRegister("haveAccount")}{" "}
            <Link
              href="/login"
              className="text-green font-semibold hover:underline underline-offset-4 ms-1"
            >
              {tRegister("logIn")}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="hidden md:block text-center text-xs text-muted pb-6">
        {t("eyebrow")}
      </footer>
    </div>
  );
}
