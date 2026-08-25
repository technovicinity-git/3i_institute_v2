import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError } from "#/shared/errors";

const SWAP_LIMIT = 2; // Per 30 days
const DAYS_IN_PERIOD = 30;

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

  /**
   * Get swap usage in the last 30 days
   */
  async getSwapUsage(
    accountId: string,
  ): Promise<{ used: number; limit: number }> {
    const thirtyDaysAgo = new Date(
      Date.now() - DAYS_IN_PERIOD * 24 * 60 * 60 * 1000,
    );

    const swapsUsed = await prisma.auditLog.count({
      where: {
        userId: accountId,
        action: "DEVICE_SWAP",
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    return {
      used: swapsUsed,
      limit: SWAP_LIMIT,
    };
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
        `Device limit reached. You have ${deviceLimit} device slot(s) available with your current subscription.`,
      );
    }

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
    const [devices, deviceLimit, currentCount, swapUsage] = await Promise.all([
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
      this.getSwapUsage(userId),
    ]);

    // Calculate seats from device limit
    const totalSeats = Math.max(0, deviceLimit - 1);

    // Format last seen
    const formattedDevices = devices.map((device) => ({
      id: device.id,
      name: device.deviceName,
      platform: device.platform,
      lastSeen: this.formatLastSeen(device.lastUsedAt),
      lastUsedAt: device.lastUsedAt,
      createdAt: device.createdAt,
    }));

    return {
      devices: formattedDevices,
      totalSeats,
      deviceLimit,
      currentCount,
      remainingSlots: Math.max(0, deviceLimit - currentCount),
      swapLimit: swapUsage.limit,
      swapsUsed: swapUsage.used,
      swapsRemaining: Math.max(0, swapUsage.limit - swapUsage.used),
    };
  }

  /**
   * Remove device with swap tracking
   */
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

    // Check swap limit
    const swapUsage = await this.getSwapUsage(userId);
    if (swapUsage.used >= swapUsage.limit) {
      throw new ConflictError(
        `Device swap limit reached. You can swap devices ${swapUsage.limit} times per 30 days.`,
      );
    }

    await prisma.device.delete({
      where: { id: deviceId },
    });

    // Log swap
    await prisma.auditLog.create({
      data: {
        userId,
        action: "DEVICE_SWAP",
        resource: "device",
        resourceId: deviceId,
        details: {
          deviceName: device.deviceName,
          platform: device.platform,
          removedAt: new Date().toISOString(),
        },
      },
    });
  }

  async removeAllDevices(userId: string) {
    const devices = await prisma.device.findMany({
      where: { userId },
    });

    for (const device of devices) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "DEVICE_SWAP",
          resource: "device",
          resourceId: device.id,
          details: {
            deviceName: device.deviceName,
            platform: device.platform,
            removedAt: new Date().toISOString(),
            bulkRemoval: true,
          },
        },
      });
    }

    await prisma.device.deleteMany({
      where: { userId },
    });
  }

  private formatLastSeen(lastUsedAt: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - lastUsedAt.getTime();
    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMinutes < 1) return "Last seen: Just now";
    if (diffMinutes < 60) return `Last seen: ${diffMinutes} minutes ago`;
    if (diffHours === 1) return "Last seen: 1 hour ago";
    if (diffHours < 24) return `Last seen: ${diffHours} hours ago`;
    if (diffDays === 1) return "Last seen: 1 day ago";
    if (diffDays < 7) return `Last seen: ${diffDays} days ago`;
    return `Last seen: ${lastUsedAt.toLocaleDateString()}`;
  }
}

export const deviceService = new DeviceService();
