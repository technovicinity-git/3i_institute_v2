import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-800 bg-brand-cream antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-3/4 md:w-1/2 bg-brand-navy clip-hero-bg z-0 hidden md:block" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 md:pr-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-brand-gold" />
              <span className="uppercase tracking-widest text-brand-gold font-semibold text-xs">
                3i — International Islamic Institute
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl text-brand-navy leading-tight mb-6 text-balance">
              Study seriously, from anywhere.
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-lg leading-relaxed">
              3i Institute is an accredited online institute offering structured
              programs across the sciences, humanities, and professional fields
              — taught by qualified faculty and assessed to a university
              standard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/get-started"
                className="bg-brand-green hover:bg-brand-green-dark text-white font-medium py-3 px-8 rounded-md transition-colors text-center shadow-md"
              >
                Explore Programs
              </Link>
              <Link
                href="#pathways"
                className="bg-white hover:bg-gray-50 text-brand-navy border border-gray-300 font-medium py-3 px-8 rounded-md transition-colors text-center shadow-sm"
              >
                View Curriculum
              </Link>
            </div>
            <div className="flex gap-12 border-t border-gray-100 pt-8">
              <div>
                <div className="text-3xl font-serif text-brand-gold mb-1">
                  12,000+
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Active Students
                </div>
              </div>
              <div>
                <div className="text-3xl font-serif text-brand-gold mb-1">
                  140+
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Rigorous Courses
                </div>
              </div>
              <div>
                <div className="text-3xl font-serif text-brand-gold mb-1">
                  38
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Expert Instructors
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative mt-12 md:mt-0">
            <div className="relative bg-white rounded-xl shadow-2xl z-10 max-w-md mx-auto md:ml-auto">
              <Image
                src="/assets/images/landing_page/student-image.png"
                alt="Student studying online"
                width={400}
                height={300}
                className="w-full rounded-t-lg mb-4 object-cover"
              />

              <div className="px-2 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-brand-navy">Sarah Chen</h3>
                  <span className="text-xs text-gray-500">
                    Graduate &apos;23
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Program: Data Analysis &amp; Statistical Methods
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-brand-green h-1.5 rounded-full w-full" />
                  </div>
                  <span className="text-[10px] text-brand-green font-medium uppercase">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-8">
            Partnered &amp; Recognized By
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <span className="text-sm font-medium text-gray-600">
              Accreditation Council
            </span>
            <span className="text-sm font-medium text-gray-600">
              Open Education Alliance
            </span>
            <span className="text-sm font-medium text-gray-600">
              Intl. Council for Distance Learning
            </span>
            <span className="text-sm font-medium text-gray-600">
              Quality Assurance Agency
            </span>
            <span className="text-sm font-medium text-gray-600">
              Global Universities Network
            </span>
          </div>
        </div>
      </section>

      {/* Three Commitments */}
      <section className="py-24 bg-brand-cream" id="about">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-4">
            The Name
          </p>
          <h2 className="font-serif text-4xl text-brand-navy mb-16">
            Three commitments in one mark
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <span className="font-serif text-5xl text-brand-gold italic mb-6">
                i
              </span>
              <h3 className="text-xl font-semibold text-brand-navy mb-3">
                International
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                Students in 40 countries, faculty drawn from universities across
                four continents.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-5xl text-brand-gold italic mb-6">
                i
              </span>
              <h3 className="text-xl font-semibold text-brand-navy mb-3">
                Islamic
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                Founded on a scholarly tradition that has valued learning,
                inquiry, and careful teaching for centuries.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-5xl text-brand-gold italic mb-6">
                i
              </span>
              <h3 className="text-xl font-semibold text-brand-navy mb-3">
                Institute
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                Structured programs, real assessment, and certificates that are
                verified and recognised.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pathways */}
      <section className="py-24 bg-white" id="pathways">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
              Curriculum Pathways
            </p>
            <h2 className="font-serif text-4xl text-brand-navy">
              Choose Your Pathway
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Computer Science & Data",
                desc: "From programming fundamentals to machine learning — structured tracks that build real analytical skill from day one.",
                modules: "14 Comprehensive Modules",
                icon: "📚",
              },
              {
                title: "Business & Economics",
                desc: "Micro and macroeconomics, financial modelling, and management theory — grounded in quantitative rigour.",
                modules: "10 Core Modules",
                icon: "📊",
              },
              {
                title: "Languages & Linguistics",
                desc: "Academic language acquisition and linguistic theory — from grammar and phonology to translation studies.",
                modules: "8 Intensive Levels",
                icon: "💬",
              },
            ].map((pathway) => (
              <a
                key={pathway.title}
                href="#"
                className="block group border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:border-brand-green/20 transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                  {pathway.icon}
                </div>
                <h3 className="text-xl font-semibold text-brand-navy mb-3">
                  {pathway.title}
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {pathway.desc}
                </p>
                <div className="flex items-center text-xs text-gray-500 font-medium">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  {pathway.modules}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-24 bg-white border-t border-gray-50" id="courses">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
                Academic Catalogue
              </p>
              <h2 className="font-serif text-4xl text-brand-navy">
                Popular Right Now
              </h2>
            </div>
            <a
              href="#"
              className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium text-sm py-2 px-6 rounded-md hover:bg-gray-50"
            >
              View All Courses
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Foundations of Data Analysis",
                instructor: "Dr. Elena Vasquez",
                level: "Beginner",
                rating: "4.8",
                imageUrl: "/assets/images/landing_page/imag1.png",
              },
              {
                title: "Academic Writing & Research Methods",
                instructor: "Prof. Sarah Sterling",
                level: "Intermediate",
                rating: "4.9",
                imageUrl: "/assets/images/landing_page/imag2.png",
              },
              {
                title: "Introduction to Microeconomics",
                instructor: "Dr. Omar Haddad",
                level: "Beginner",
                rating: "4.7",
                imageUrl: "/assets/images/landing_page/imag3.png",
              },
              {
                title: "Human Anatomy & Physiology",
                instructor: "Dr. Amina Rahman",
                level: "Intermediate",
                rating: "4.9",
                imageUrl: "/assets/images/landing_page/imag4.png",
              },
            ].map((course) => (
              <div
                key={course.title}
                className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full"
              >
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${course.level === "Beginner" ? "text-brand-green bg-green-50" : "text-blue-600 bg-blue-50"}`}
                    >
                      {course.level}
                    </span>
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <svg
                        className="w-4 h-4 text-amber-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {course.rating}
                    </div>
                  </div>
                  <h3 className="font-serif text-xl text-brand-navy mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 flex-grow">
                    {course.instructor}
                  </p>
                  <a
                    href="#"
                    className="text-brand-green text-sm font-semibold hover:text-brand-green-dark flex items-center justify-end mt-auto"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section className="py-24 bg-brand-cream border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
            Learning Journey
          </p>
          <h2 className="font-serif text-4xl text-brand-navy">
            Rigorous, Flexible, Connected
          </h2>
        </div>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div>
            <div className="text-6xl font-serif text-brand-gold/30 mb-4">
              01
            </div>
            <h3 className="text-xl font-semibold text-brand-navy mb-3">
              Enroll &amp; Align
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Select your pathway or dual-discipline track. Meet with an
              academic advisor to map your spiritual and professional goals.
            </p>
          </div>
          <div>
            <div className="text-6xl font-serif text-brand-gold/30 mb-4">
              02
            </div>
            <h3 className="text-xl font-semibold text-brand-navy mb-3">
              Learn &amp; Interact
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Access live scholarly seminars, rich pre-recorded material, and
              rigorous practical modules.
            </p>
          </div>
          <div>
            <div className="text-6xl font-serif text-brand-gold/30 mb-4">
              03
            </div>
            <h3 className="text-xl font-semibold text-brand-navy mb-3">
              Graduate &amp; Apply
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Earn accredited certifications recognized globally. Step
              confidently into roles of spiritual guidance or holistic
              healthcare advocacy.
            </p>
          </div>
        </div>
      </section>

      {/* Faculty */}
      <section className="py-24 bg-white" id="faculty">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
              Faculty of Distinction
            </p>
            <h2 className="font-serif text-4xl text-brand-navy">
              Learn from Qualified Faculty
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Dr. Elena Vasquez",
                role: "Ph.D. in Statistics",
                imageUrl: "/assets/images/landing_page/elena.png",
              },
              {
                name: "Prof. Sarah Sterling",
                role: "Professor of Rhetoric",
                imageUrl: "/assets/images/landing_page/sarah.png",
              },
              {
                name: "Dr. Omar Haddad",
                role: "Ph.D. in Economics",
                imageUrl: "/assets/images/landing_page/omar.png",
              },
              {
                name: "Dr. Amina Rahman",
                role: "MBBS, MSc Physiology",
                imageUrl: "/assets/images/landing_page/amin.png",
              },
            ].map((faculty) => (
              <div
                key={faculty.name}
                className="border border-gray-100 rounded-xl overflow-hidden group"
              >
                <div className="w-full h-48  group-hover:grayscale-0 transition-all duration-300 flex items-center justify-center">
                  <Image
                    src={faculty.imageUrl}
                    alt={faculty.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg text-brand-navy mb-1">
                    {faculty.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {faculty.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials CTA */}
      <section className="bg-brand-navy py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="w-full md:w-1/2 text-white">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-4">
              Verified Credentials
            </p>
            <h2 className="font-serif text-4xl mb-6">
              A certificate that holds its weight.
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-md">
              Our certificates are verified by an independent accreditation
              body.
            </p>
            <a
              href="#"
              className="inline-block bg-brand-green hover:bg-brand-green-dark text-white font-medium py-3 px-8 rounded-md transition-colors shadow-md"
            >
              Learn About Accreditation
            </a>
          </div>
          <div className="w-full md:w-1/2">
            <div className="bg-white p-8 rounded shadow-2xl max-w-lg mx-auto">
              <div className="border-2 border-brand-gold/30 p-8 text-center">
                <h4 className="font-serif text-brand-navy text-xl uppercase tracking-widest mb-4">
                  3i International Islamic Institute
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                  This is to certify that
                </p>
                <h3 className="font-serif text-2xl text-brand-navy mb-4">
                  Muhammad Al-Farabi
                </h3>
                <p className="text-xs text-gray-600">
                  has completed the program in Data Analysis &amp; Statistical
                  Methods
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
              Student Success
            </p>
            <h2 className="font-serif text-4xl text-brand-navy">
              Transforming Careers and Ambitions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "James L.",
                role: "Research Analyst",
                quote:
                  "The data analysis programme gave me the quantitative skills I'd been missing.",
                imageUrl: "/assets/images/landing_page/james.png",
              },
              {
                name: "Priya M.",
                role: "Postgraduate Student",
                quote:
                  "The academic writing course sharpened my research methodology.",
                imageUrl: "/assets/images/landing_page/omar2.png",
              },
              {
                name: "Omar T.",
                role: "Policy Officer",
                quote:
                  "The economics programme was exactly the structured education I was looking for.",
                imageUrl: "/assets/images/landing_page/priya1.png",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col"
              >
                <p className="text-sm text-gray-600 italic leading-relaxed mb-8 flex-grow">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    src={t.imageUrl}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-4">
            Your Journey Starts Here
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-navy mb-6">
            Begin at 3i this week
          </h2>
          <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
            Join thousands of active students globally.
          </p>
          <Link
            href="/get-started"
            className="inline-block bg-brand-green hover:bg-brand-green-dark text-white font-medium py-3 px-10 rounded-md transition-colors shadow-md text-lg"
          >
            Join 3i Institute
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
