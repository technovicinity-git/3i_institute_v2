import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError } from "#/shared/errors";

/**
 * Device limit rule:
 * - Base: 1 device per account (minimum)
 * - Additional: 1 device per purchased seat
 * - Formula: maxDevices = 1 + seats
 *
 * Examples:
 * - 1 seat → 2 devices
 * - 2 seats → 3 devices
 * - 3 seats → 4 devices
 */
export class DeviceService {
  async getDeviceLimit(accountId: string): Promise<number> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        accountId,
        status: "ACTIVE",
      },
      select: {
        seats: true,
      },
    });

    const seats = subscription?.seats ?? 0;
    return 1 + seats;
  }

  async getCurrentDeviceCount(accountId: string): Promise<number> {
    return prisma.device.count({
      where: { userId: accountId },
    });
  }

  async registerDevice(
    userId: string,
    data: {
      deviceName: string;
      deviceToken: string;
      platform: string;
    },
  ) {
    const [deviceLimit, currentCount] = await Promise.all([
      this.getDeviceLimit(userId),
      this.getCurrentDeviceCount(userId),
    ]);

    if (currentCount >= deviceLimit) {
      throw new ConflictError(
        `Device limit reached. You have ${deviceLimit} device slot(s) available with your current subscription. Upgrade to add more seats and get more device slots.`,
      );
    }

    // Check if this token already exists
    const existing = await prisma.device.findFirst({
      where: { deviceToken: data.deviceToken },
    });

    if (existing) {
      const updated = await prisma.device.update({
        where: { id: existing.id },
        data: {
          lastUsedAt: new Date(),
          deviceName: data.deviceName,
        },
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
    const [devices, deviceLimit, currentCount] = await Promise.all([
      prisma.device.findMany({
        where: { userId },
        select: {
          id: true,
          deviceName: true,
          platform: true,
          lastUsedAt: true,
          createdAt: true,
        },
        orderBy: { lastUsedAt: "desc" },
      }),
      this.getDeviceLimit(userId),
      this.getCurrentDeviceCount(userId),
    ]);

    return {
      devices,
      deviceLimit,
      currentCount,
      remainingSlots: Math.max(0, deviceLimit - currentCount),
    };
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
