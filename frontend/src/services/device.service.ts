import { apiClient } from "@/lib/api-client";

export interface Device {
  id: string;
  name: string;
  platform: "ios" | "android" | "web";
  lastSeen: string;
  lastUsedAt: string;
  createdAt: string;
}

export interface DevicesResponse {
  devices: Device[];
  totalSeats: number;
  deviceLimit: number;
  currentCount: number;
  remainingSlots: number;
  swapLimit: number;
  swapsUsed: number;
  swapsRemaining: number;
}

export const deviceService = {
  getDevices: async (): Promise<DevicesResponse> => {
    const response = await apiClient.get("/devices");
    return response.data.data;
  },

  removeDevice: async (deviceId: string): Promise<void> => {
    await apiClient.delete(`/devices/${deviceId}`);
  },

  removeAllDevices: async (): Promise<void> => {
    await apiClient.delete("/devices");
  },
};
