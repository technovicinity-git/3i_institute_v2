import Link from "next/link";

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <span className="w-8 h-8 md:w-9 md:h-9 bg-primary text-white rounded flex items-center justify-center font-serif text-lg md:text-xl leading-none">
            3i
          </span>
          <span className="font-serif text-xl md:text-2xl leading-none">
            3i
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#"
            className="text-sm font-semibold text-muted hover:text-green"
          >
            English
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-muted hover:text-green"
          >
            Help &amp; Support
          </a>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 py-10 md:px-10 md:py-16">
        <div className="w-full max-w-[400px] md:max-w-4xl flex flex-col items-center">
          {/* Intro */}
          <section className="w-full text-center flex flex-col items-center mb-10 md:mb-12">
            <div className="hidden md:block uppercase tracking-widest text-[11px] font-bold text-gold mb-3">
              INTERNATIONAL ISLAMIC INSTITUTE
            </div>

            <h1 className="font-serif text-[28px] leading-tight text-primary md:text-[48px] md:leading-[1.1]">
              How will you be using 3i?
            </h1>

            <p className="mt-3 md:mt-4 text-base leading-6 text-muted max-w-[300px] md:max-w-lg">
              You can always add family members later, whichever you choose.
            </p>
          </section>

          {/* Options */}
          <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* For Myself */}
            <Link
              href="/register"
              className="option-card w-full text-left bg-white border border-outline-variant rounded-xl p-4 md:p-8 flex flex-col min-h-[250px] md:min-h-[300px] hover:border-green hover:shadow-sm transition-all duration-180 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container rounded flex items-center justify-center text-primary mb-4 md:mb-6">
                <span className="text-xl">👤</span>
              </div>
              <h2 className="font-serif text-[22px] md:text-[28px] leading-tight text-primary mb-3">
                For myself
              </h2>
              <p className="text-base leading-6 text-muted mb-6 md:mb-8 flex-1">
                I&apos;m here to learn — Islamic studies courses for adults.
              </p>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green group-hover:text-primary">
                Choose this option
                <span>→</span>
              </span>
            </Link>

            {/* For Family */}
            <Link
              href="/register"
              className="option-card w-full text-left bg-white border-2 border-green rounded-xl p-4 md:p-8 flex flex-col min-h-[250px] md:min-h-[300px] hover:bg-surface-low hover:shadow-sm transition-all duration-180 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green/10 rounded flex items-center justify-center text-green mb-4 md:mb-6">
                <span className="text-xl">👨‍👩‍👧‍👦</span>
              </div>
              <h2 className="font-serif text-[22px] md:text-[28px] leading-tight text-primary mb-3">
                For my family
              </h2>
              <p className="text-base leading-6 text-muted mb-6 md:mb-8 flex-1">
                I&apos;m signing up to add my children or teens as learners.
              </p>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green">
                Choose this option
                <span>→</span>
              </span>
            </Link>
          </section>

          {/* Login */}
          <div className="mt-8 md:mt-12 text-center text-base text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green font-semibold hover:underline underline-offset-4 ml-1"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="hidden md:block text-center text-xs text-muted pb-6">
        International Islamic Institute
      </footer>
    </div>
  );
}
