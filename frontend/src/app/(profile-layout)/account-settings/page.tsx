"use client";

import Link from "next/link";

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M14 17.5V15.8333C14 14.9493 13.6488 14.1014 13.0237 13.4763C12.3986 12.8512 11.5507 12.5 10.6667 12.5H4.33333C3.44928 12.5 2.60143 12.8512 1.97631 13.4763C1.35119 14.1014 1 14.9493 1 15.8333V17.5"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 9.16667C9.34095 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34095 2.5 7.5 2.5C5.65905 2.5 4.16667 3.99238 4.16667 5.83333C4.16667 7.67428 5.65905 9.16667 7.5 9.16667Z"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 17.5V15.8333C18.9992 15.0948 18.7593 14.3773 18.3167 13.7917C17.8742 13.2061 17.2532 12.784 16.5417 12.5917"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0417 2.59167C13.7547 2.78296 14.3772 3.20536 14.8206 3.79167C15.264 4.37798 15.504 5.09688 15.504 5.8375C15.504 6.57812 15.264 7.29702 14.8206 7.88333C14.3772 8.46964 13.7547 8.89204 13.0417 9.08333"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmartphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="4"
        y="1.5"
        width="12"
        height="17"
        rx="2"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="10"
        y1="15"
        x2="10.01"
        y2="15"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="1.5"
        y="3.5"
        width="17"
        height="13"
        rx="2"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="1.5"
        y1="8.5"
        x2="18.5"
        y2="8.5"
        stroke="#0C1F33"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="3.5"
        y="9"
        width="13"
        height="9"
        rx="2"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9V6C6 4.93913 6.42143 3.92172 7.17157 3.17157C7.92172 2.42143 8.93913 2 10 2C11.0609 2 12.0783 2.42143 12.8284 3.17157C13.5786 3.92172 14 4.93913 14 6V9"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 4L10 8L6 12"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Settings Row ----

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function SettingsRow({ icon, title, description, href }: SettingsRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-6 bg-white border border-[#E3E8EF] rounded-xl shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Icon circle */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F9F6F0] shrink-0">
          {icon}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <h3
            className="text-lg font-normal text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            {title}
          </h3>
          <p className="text-[15px] text-[#475569] leading-snug">
            {description}
          </p>
        </div>
      </div>

      {/* Chevron */}
      <div className="shrink-0 ml-4 group-hover:translate-x-0.5 transition-transform">
        <ChevronRightIcon />
      </div>
    </Link>
  );
}

const settingsItems: SettingsRowProps[] = [
  {
    icon: <UsersIcon />,
    title: "Family & profiles",
    description: "Manage learner profiles, PINs, and seats",
    href: "/profile-management",
  },
  {
    icon: <SmartphoneIcon />,
    title: "Devices",
    description: "See and remove devices signed into your account",
    href: "/device-management",
  },
  {
    icon: <CreditCardIcon />,
    title: "Subscription & billing",
    description: "View your plan, payment method, and invoices",
    href: "/account/billing",
  },
  {
    icon: <LockIcon />,
    title: "Login & security",
    description: "Update your email and password",
    href: "/login-security",
  },
];

// ---- Page ----

export default function AccountSettingsPage() {
  return (
    <div style={{ fontFamily: "'Figtree', sans-serif" }}>
      <main className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-[120px] xl:px-0 py-10 sm:py-14">
        <h1
          className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33] mb-6 sm:mb-9"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Account settings
        </h1>

        <div className="flex flex-col gap-4">
          {settingsItems.map((item) => (
            <SettingsRow key={item.title} {...item} />
          ))}
        </div>
      </main>
    </div>
  );
}
