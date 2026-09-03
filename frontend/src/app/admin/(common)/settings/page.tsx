"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Bell, Globe, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: "3i International Islamic Institute",
    supportEmail: "support@3iinstitute.edu",
    registrationOpen: true,
    instructorApplicationsOpen: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  const handleSave = () => {
    toast.success("Settings saved");
  };

  return (
    <div className="p-6 md:p-10 max-w-[700px] mx-auto">
      <div className="mb-8">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Settings
        </h1>
        <p className="text-base text-[#64748B]">Platform configuration.</p>
      </div>

      {/* General */}
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#0C1F33] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#B8912F]" />
          General
        </h2>

        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Platform Name
          </label>
          <input
            value={settings.platformName}
            onChange={(e) =>
              setSettings({ ...settings, platformName: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Support Email
          </label>
          <input
            value={settings.supportEmail}
            onChange={(e) =>
              setSettings({ ...settings, supportEmail: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.registrationOpen}
            onChange={(e) =>
              setSettings({ ...settings, registrationOpen: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-sm">Registration open</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.instructorApplicationsOpen}
            onChange={(e) =>
              setSettings({
                ...settings,
                instructorApplicationsOpen: e.target.checked,
              })
            }
            className="w-4 h-4"
          />
          <span className="text-sm">Instructor applications open</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#0C1F33] flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#B8912F]" />
          Notifications
        </h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) =>
              setSettings({ ...settings, emailNotifications: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-sm">Email notifications</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) =>
              setSettings({ ...settings, pushNotifications: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-sm">Push notifications</span>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-3 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
      >
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </div>
  );
}
