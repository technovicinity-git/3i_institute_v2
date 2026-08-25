"use client";

// ---- Icons ----

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

function MonitorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2"
        y="3"
        width="16"
        height="11"
        rx="2"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="7"
        y1="17"
        x2="13"
        y2="17"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="14"
        x2="10"
        y2="17"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="3.5"
        y="1.5"
        width="13"
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

// ---- Types ----

interface Device {
  id: string;
  name: string;
  lastSeen: string;
  icon: React.ReactNode;
}

// ---- Device Row ----

function DeviceRow({
  device,
  onDeauthorise,
}: {
  device: Device;
  onDeauthorise: (id: string) => void;
}) {
  return (
    <div className="flexitems-center justify-between px-6 py-2.5 bg-white border border-[#E3E8EF] rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        {/* Device icon */}
        <div className="shrink-0 flex items-center justify-center w-5 h-5">
          {device.icon}
        </div>

        {/* Device info */}
        <div className="flex flex-col gap-0.5">
          <span className="text-base text-[#0C1F33]">{device.name}</span>
          <span className="text-[13px] text-[#475569]">{device.lastSeen}</span>
        </div>
      </div>

      {/* De-authorise action */}
      <button
        onClick={() => onDeauthorise(device.id)}
        className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors shrink-0 ml-4"
      >
        De-authorise
      </button>
    </div>
  );
}

// ---- Sample data ----

const devices: Device[] = [
  {
    id: "1",
    name: "iPhone 14 Pro",
    lastSeen: "Last seen: 2 hours ago",
    icon: <SmartphoneIcon />,
  },
  {
    id: "2",
    name: "MacBook Pro",
    lastSeen: "Last seen: Just now",
    icon: <MonitorIcon />,
  },
  {
    id: "3",
    name: "iPad Air",
    lastSeen: "Last seen: 3 days ago",
    icon: <TabletIcon />,
  },
];

// ---- Page Content ----

export default function YourDevicesPage() {
  const totalSeats = 3;
  const maxDevices = 5;
  const devicesInUse = devices.length;
  const swapLimit = 2;
  const swapsUsed = 1;

  function handleDeauthorise(deviceId: string) {
    console.log(`De-authorise device: ${deviceId}`);
  }

  return (
    <section
      className="w-full  h-full  bg-[#FBF9F4] px-6 sm:px-10 lg:px-[120px] pt-10 sm:pt-14 pb-16 sm:pb-20"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Title */}
        <h1
          className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Your devices
        </h1>

        {/* Summary card */}
        <div className="flex items-center justify-center px-6 py-5 bg-white border border-[#E3E8EF] rounded-lg shadow-sm">
          <p className="text-base text-[#0C1F33] text-center">
            You have {totalSeats} seats, so up to {maxDevices} devices.{" "}
            <span className="font-medium">
              {devicesInUse} of {maxDevices} in use.
            </span>
          </p>
        </div>

        {/* Device list */}
        <div className="flex flex-col gap-4">
          {devices.map((device) => (
            <DeviceRow
              key={device.id}
              device={device}
              onDeauthorise={handleDeauthorise}
            />
          ))}
        </div>

        {/* Swap limit note */}
        <p className="text-[13px] text-[#475569]">
          You can swap devices up to {swapLimit} times every 30 days.
          You&apos;ve used {swapsUsed} of {swapLimit}.
        </p>
      </div>
    </section>
  );
}
