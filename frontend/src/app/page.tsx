import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import TrustStrip from "@/components/landing/TrustStrip";
import Hero from "@/components/landing/Hero";
import BrandExplainer from "@/components/landing/BrandExplainer";
import Programs from "@/components/landing/Programs";
import PopularCourses from "@/components/landing/PopularCourses";
import Faculty from "@/components/landing/Faculty";
import Testimonials from "@/components/landing/Testimonials";
import { getTranslations } from "next-intl/server";

const JOURNEY = ["s1", "s2", "s3"] as const;

export default async function LandingPage() {
  const t = await getTranslations("landing");
  return (
    <div className="font-sans text-gray-800 bg-brand-cream antialiased">
      <Navbar />
      <Hero />
      <TrustStrip />
      <BrandExplainer />
      <Programs />

      <PopularCourses />

      {/* Learning Journey */}
      <section className="py-24 bg-brand-cream border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
            {t("journey.eyebrow")}
          </p>
          <h2 className="font-serif text-4xl text-brand-navy">
            {t("journey.title")}
          </h2>
        </div>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-start">
          {JOURNEY.map((step, i) => (
            <div key={step}>
              <div className="text-6xl font-serif text-brand-gold/30 mb-4">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl font-semibold text-brand-navy mb-3">
                {t(`journey.${step}Title`)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(`journey.${step}Text`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Faculty />

      {/* Credentials CTA */}
      <section className="bg-brand-navy py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="w-full md:w-1/2 text-white">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-4">
              {t("credentials.eyebrow")}
            </p>
            <h2 className="font-serif text-4xl mb-6">
              {t("credentials.title")}
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-md">
              {t("credentials.body")}
            </p>
            <Link
              href="/courses"
              className="inline-block bg-brand-green hover:bg-brand-green-dark text-white font-medium py-3 px-8 rounded-md transition-colors shadow-md"
            >
              {t("credentials.explore")}
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <div className="bg-white p-8 rounded shadow-2xl max-w-lg mx-auto">
              <div className="border-2 border-brand-gold/30 p-8 text-center">
                <h4 className="font-serif text-brand-navy text-xl uppercase tracking-widest mb-4">
                  3i International Islamic Institute
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                  {t("credentials.certify")}
                </p>
                <h3 className="font-serif text-2xl text-brand-navy mb-4">
                  Muhammad Al-Farabi
                </h3>
                <p className="text-xs text-gray-600">
                  {t("credentials.completedProgram")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Final CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-4">
            {t("cta.eyebrow")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-navy mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
            {t("cta.body")}
          </p>
          <Link
            href="/get-started"
            className="inline-block bg-brand-green hover:bg-brand-green-dark text-white font-medium py-3 px-10 rounded-md transition-colors shadow-md text-lg"
          >
            {t("cta.join")}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
