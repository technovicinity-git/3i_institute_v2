import Image from "next/image";

const stats = [
  { value: "12,000+", label: "Active Students" },
  { value: "140+", label: "Rigorous Courses" },
  { value: "38", label: "Expert Instructors" },
];

export default function Hero() {
  return (
    <section className="relative w-full bg-white overflow-hidden h-[720px]">
      <div className="flex h-full">
        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-center pl-24 pr-12 w-[55%]">
          {/* Subtitle */}
          <p className="text-[16px] font-bold tracking-wide text-[#c8a415] uppercase mb-5">
            3i — International Islamic Institute
          </p>

          {/* Heading */}
          <h1 className="font-serif text-[56px] leading-[1.14] text-[#12304E] mb-5 max-w-[624px]">
            Study seriously, from anywhere.
          </h1>

          {/* Description */}
          <p className="text-[18px] text-[#0C1F33] leading-[1.6] max-w-[624px] mb-8">
            3i Institute is an accredited online institute offering structured
            programs across the sciences, humanities, and professional fields —
            taught by qualified faculty and assessed to a university standard.
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4 mb-12">
            <a
              href="#"
              className="inline-flex items-center justify-center px-7 py-3 bg-[#22A146] text-white font-semibold text-[15px] rounded-full hover:bg-[#1d8c3b] transition-colors"
            >
              Explore Programs
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-7 py-3 border-2 border-[#12304E] text-[#12304E] font-semibold text-[15px] rounded-full hover:bg-[#12304E] hover:text-white transition-colors"
            >
              View Curriculum
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-12 border-t border-gray-200 pt-6 max-w-[624px]">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-[120px]">
                <p className="font-serif text-[28px] text-[#12304E] leading-tight">
                  {stat.value}
                </p>
                <p className="text-[13px] font-medium text-[#6B7280] mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Navy diagonal with student card */}
        <div className="relative w-[45%] h-full">
          {/* Navy diagonal background */}
          <svg
            className="absolute top-0 right-0 h-full"
            width="700"
            height="720"
            viewBox="0 0 700 720"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="0,0 700,0 700,720 400,720" fill="#12304E" />
          </svg>

          {/* Diamond/Star pattern overlay */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="relative w-[680px] h-[720px] opacity-[0.08]">
              <svg
                viewBox="0 0 680 720"
                fill="none"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M340 0 L680 360 L340 720 L0 360 Z"
                  stroke="white"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M340 60 L620 360 L340 660 L60 360 Z"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
                <path
                  d="M340 120 L560 360 L340 600 L120 360 Z"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
                <path
                  d="M340 180 L500 360 L340 540 L180 360 Z"
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* Student Card */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden w-[380px]">
              {/* Student Image */}
              <div className="relative w-full h-[320px]">
                <Image
                  src="/assets/images/landing_page/student-image.png"
                  alt="Sarah Chen studying at her desk"
                  fill
                  className="object-cover"
                  sizes="380px"
                />
              </div>

              {/* Student Details */}
              <div className="px-5 py-5">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-[14px] font-bold text-[#12304E]">
                    Sarah Chen
                  </h3>
                  <span className="text-[12px] font-semibold text-[#6B7280]">
                    Graduate &apos;23
                  </span>
                </div>
                <p className="text-[12px] text-[#4B5563] mb-3">
                  Program: Data Analysis &amp; Statistical Methods
                </p>
                <span className="inline-block px-3 py-1 bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
