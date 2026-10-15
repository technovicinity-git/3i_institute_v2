"use client";

import { useDevices, useRemoveDeviceMutation } from "@/hooks/use-devices";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";

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

function getDeviceIcon(platform: string) {
  switch (platform) {
    case "ios":
    case "android":
      return <SmartphoneIcon />;
    case "web":
      return <MonitorIcon />;
    default:
      return <TabletIcon />;
  }
}

// ---- Page ----

export default function YourDevicesPage() {
  const t = useTranslations("devices");
  const tCommon = useTranslations("common");
  const format = useDateFormat();
  const { data, isLoading, isError } = useDevices();
  const removeDeviceMutation = useRemoveDeviceMutation();
  const confirm = useConfirm();

  function handleDeauthorise(device: { id: string; name: string }) {
    confirm({
      tone: "warning",
      title: t("deauthoriseTitle"),
      description: t.rich("deauthoriseBody", {
        name: device.name,
        strong: (chunks) => (
          <span className="font-semibold text-[#0C1F33]">{chunks}</span>
        ),
      }),
      confirmLabel: t("deauthorise"),
      onConfirm: () => removeDeviceMutation.mutateAsync(device.id),
    });
  }

  return (
    <section
      className="w-full min-h-full bg-[#FBF9F4] px-6 sm:px-10 lg:px-[120px] pt-10 sm:pt-14 pb-16 sm:pb-20"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Title */}
        <h1
          className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-600 font-medium">{t("loadFailed")}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#22A146] font-semibold hover:underline"
            >
              {tCommon("tryAgain")}
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && data && (
          <>
            {/* Summary card */}
            <div className="flex items-center justify-center px-6 py-5 bg-white border border-[#E3E8EF] rounded-lg shadow-sm">
              <p className="text-base text-[#0C1F33] text-center">
                {t("summary", {
                  seats: data.totalSeats,
                  limit: data.deviceLimit,
                })}{" "}
                <span className="font-medium">
                  {t("inUse", {
                    count: data.currentCount,
                    limit: data.deviceLimit,
                  })}
                </span>
              </p>
            </div>

            {/* Device list */}
            {data.devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-[#64748B]">{t("empty")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between px-6 py-4 bg-white border border-[#E3E8EF] rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 flex items-center justify-center w-5 h-5">
                        {getDeviceIcon(device.platform)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base text-[#0C1F33]">
                          {device.name}
                        </span>
                        <span className="text-[13px] text-[#475569]">
                          {t("lastSeen", { when: format.relative(device.lastUsedAt) })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeauthorise(device)}
                      disabled={removeDeviceMutation.isPending}
                      className="text-sm font-semibold transition-colors shrink-0 ms-4 disabled:opacity-50 text-red-600 hover:text-red-700"
                    >
                      {t("deauthorise")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Swap limit note */}
            <p className="text-[13px] text-[#475569]">
              {t("swapNote", { limit: data.swapLimit, used: data.swapsUsed })}
              {data.swapsRemaining > 0 && (
                <span className="font-medium text-[#22A146]">
                  {" "}
                  {t("swapsRemaining", { count: data.swapsRemaining })}
                </span>
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
