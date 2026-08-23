const columns = [
  {
    title: "International",
    description:
      "Students in 40 countries, faculty drawn from universities across four continents.",
  },
  {
    title: "Islamic",
    description:
      "Founded on a scholarly tradition that has valued learning, inquiry, and careful teaching for centuries.",
  },
  {
    title: "Institute",
    description:
      "Structured programs, real assessment, and certificates that are verified and recognised.",
  },
];

export default function BrandExplainer() {
  return (
    <section className="w-full bg-white py-[120px] px-[130px]">
      <div className="max-w-[1180px] mx-auto flex flex-col items-center gap-12">
        {/* Label */}
        <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-[#B8912F]">
          The Name
        </p>

        {/* Title */}
        <h2 className="font-serif text-[40px] text-[#12304E] text-center">
          Three commitments in one mark
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
