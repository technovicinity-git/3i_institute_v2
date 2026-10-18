import { useTranslations } from "next-intl";

const COLUMNS = ["c1", "c2", "c3"] as const;

export default function BrandExplainer() {
  const t = useTranslations("landing.brand");
  const columns = COLUMNS.map((key) => ({
    title: t(`${key}Title`),
    description: t(`${key}Text`),
  }));
  return (
    <section
      id="about"
      className="w-full bg-white py-16 md:py-[120px] px-6 md:px-[130px] scroll-mt-20"
    >
      <div className="max-w-[1180px] mx-auto flex flex-col items-center gap-12">
        {/* Label */}
        <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#B8912F]">
          {t("eyebrow")}
        </p>

        {/* Title */}
        <h2 className="font-serif text-3xl md:text-[40px] text-[#12304E] text-center">
          {t("title")}
        </h2>

        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          {columns.map((col) => (
            <div
              key={col.title}
              className="flex flex-col items-center gap-4 text-center"
            >
              {/* Icon "i" */}
              <span className="font-serif text-[72px] leading-none text-[#B8912F]">
                i
              </span>

              {/* Column Title */}
              <h3 className="text-[20px] font-bold text-[#12304E]">
                {col.title}
              </h3>

              {/* Column Description */}
              <p className="text-[15px] leading-relaxed text-[#64748B] max-w-[320px]">
                {col.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
