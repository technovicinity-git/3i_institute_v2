import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError } from "#/shared/errors";

export class DeviceService {
  async registerDevice(
    userId: string,
    data: {
      deviceName: string;
      deviceToken: string;
      platform: string;
    },
  ) {
    // Check device limit (FR-AUTH-11: max 3)
    const deviceCount = await prisma.device.count({
      where: { userId },
    });

    if (deviceCount >= 3) {
      throw new ConflictError(
        "Maximum of 3 devices reached. Manage your devices in settings.",
      );
    }

    // Check if this token already exists
    const existing = await prisma.device.findFirst({
      where: { deviceToken: data.deviceToken },
    });

    if (existing) {
      // Update last used
      const updated = await prisma.device.update({
        where: { id: existing.id },
        data: { lastUsedAt: new Date(), deviceName: data.deviceName },
      });
      return updated;
    }

    const device = await prisma.device.create({
      data: {
        userId,
        deviceName: data.deviceName,
        deviceToken: data.deviceToken,
        platform: data.platform,
      },
    });

    return device;
  }

  async getDevices(userId: string) {
    const devices = await prisma.device.findMany({
      where: { userId },
      select: {
        id: true,
        deviceName: true,
        platform: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: "desc" },
    });

    return devices;
  }

  async removeDevice(userId: string, deviceId: string) {
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId,
      },
    });

    if (!device) {
      throw new NotFoundError("Device not found");
    }

    await prisma.device.delete({
      where: { id: deviceId },
    });
  }

  async removeAllDevices(userId: string) {
    await prisma.device.deleteMany({
      where: { userId },
    });
  }
}

export const deviceService = new DeviceService();
