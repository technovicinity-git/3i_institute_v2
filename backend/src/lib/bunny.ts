import { env } from "#/config/env";

interface BunnyVideoResponse {
  guid: string;
  videoLibraryId: number;
  title: string;
  status: number;
  length: number;
  thumbnailUrl: string;
  availableResolutions: string;
  captions?: Array<{
    srclang: string;
    label: string;
  }>;
}

interface BunnyCollectionResponse {
  guid: string;
  videoLibraryId: number;
  name: string;
  videoCount: number;
  totalSize: number;
}

class BunnyStreamService {
  private readonly apiKey: string;
  private readonly libraryId: string;
  private readonly cdnHostname: string;
  private readonly baseUrl = "https://video.bunnycdn.com";

  constructor() {
    this.apiKey = env.BUNNY_API_KEY;
    this.libraryId = env.BUNNY_LIBRARY_ID;
    this.cdnHostname = env.BUNNY_CDN_HOSTNAME;
  }

  private get headers() {
    return {
      AccessKey: this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async createVideo(
    title: string,
    _collectionId?: string,
  ): Promise<BunnyVideoResponse> {
    const response = await fetch(
      `${this.baseUrl}/library/${this.libraryId}/videos`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          title,
          // Remove collectionId — videos go to root library
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bunny Stream createVideo failed: ${error}`);
    }

    return (await response.json()) as BunnyVideoResponse;
  }

  async uploadVideo(
    videoId: string,
    fileBuffer: Buffer,
    _filename: string,
  ): Promise<void> {
    const url = `${this.baseUrl}/library/${this.libraryId}/videos/${videoId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        ...this.headers,
        "Content-Type": "application/octet-stream",
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bunny Stream uploadVideo failed: ${error}`);
    }
  }

  async addCaptions(
    videoId: string,
    captionsFile: Buffer,
    srclang: string,
    label: string,
  ): Promise<void> {
    const url = `${this.baseUrl}/library/${this.libraryId}/videos/${videoId}/captions/${srclang}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...this.headers,
        "Content-Type": "application/octet-stream",
      },
      body: JSON.stringify({
        srclang,
        label,
        captionsFile: captionsFile.toString("base64"),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bunny Stream addCaptions failed: ${error}`);
    }
  }

  async getSignedUrl(
    videoId: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + expirySeconds;

    // Bunny Stream token signing
    // Uses SHA256 hash of: securityKey + videoId + expires
    const crypto = await import("node:crypto");

    // You also need a BUNNY_STREAM_SECURITY_KEY in env
    const securityKey =
      process.env["BUNNY_STREAM_SECURITY_KEY"] || env.BUNNY_API_KEY;

    const token = crypto
      .createHash("sha256")
      .update(`${securityKey}${videoId}${expires}`)
      .digest("hex");

    return `https://${this.cdnHostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;
  }

  async deleteVideo(videoId: string): Promise<void> {
    const url = `${this.baseUrl}/library/${this.libraryId}/videos/${videoId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bunny Stream deleteVideo failed: ${error}`);
    }
  }

  async getVideo(videoId: string): Promise<BunnyVideoResponse> {
    const url = `${this.baseUrl}/library/${this.libraryId}/videos/${videoId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bunny Stream getVideo failed: ${error}`);
    }

    return (await response.json()) as BunnyVideoResponse;
  }

  async createCollection(name: string): Promise<BunnyCollectionResponse> {
    const url = `${this.baseUrl}/library/${this.libraryId}/collections`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bunny Stream createCollection failed: ${error}`);
    }

    return (await response.json()) as BunnyCollectionResponse;
  }
}

export const bunnyStream = new BunnyStreamService();
