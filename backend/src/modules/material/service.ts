import { prisma } from "#/lib/prisma";
import { bunnyStream } from "#/lib/bunny";
import { storageService } from "#/lib/storage";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type {
  CreateMaterialInput,
  UpdateMaterialInput,
  UploadVideoInput,
} from "#/modules/material/schema";

const MAX_VIDEO_SIZE = 4 * 1024 * 1024 * 1024; // 4GB
const MAX_AUDIO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024; // 100MB

export class MaterialService {
  async create(instructorId: string, input: CreateMaterialInput) {
    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only add materials to your own courses",
      );
    }

    const material = await prisma.material.create({
      data: {
        courseId: input.courseId,
        title: input.title,
        type: input.type,
        url: input.url ?? "",
        order: input.order,
        duration: input.duration ?? null,
      },
    });

    return material;
  }

  /**
   * Upload a video to Bunny Stream
   * FR-MAT-02: Video uses resumable (TUS) upload, max 4GB
   * FR-MAT-06: English caption files required at video upload
   */
  async uploadVideo(
    instructorId: string,
    input: UploadVideoInput,
    videoFile: Buffer,
    captionsFile: Buffer,
  ) {
    // Validate file sizes
    if (videoFile.length > MAX_VIDEO_SIZE) {
      throw new ValidationError("Video file exceeds 4GB limit");
    }

    if (videoFile.length === 0) {
      throw new ValidationError("Video file is empty");
    }

    if (captionsFile.length === 0) {
      throw new ValidationError("Caption file (VTT/SRT) is required");
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only upload videos to your own courses",
      );
    }

    // Create video object in Bunny Stream
    const video = await bunnyStream.createVideo(
      input.title,
      course.id, // Use course ID as collection ID
    );

    try {
      // Upload video file
      await bunnyStream.uploadVideo(
        video.guid,
        videoFile,
        `${input.title}.mp4`,
      );

      // Add English captions
      await bunnyStream.addCaptions(video.guid, captionsFile, "en", "English");

      // Create material record with Bunny video ID
      const material = await prisma.material.create({
        data: {
          courseId: input.courseId,
          title: input.title,
          type: "video",
          url: video.guid, // Store Bunny GUID, not full URL
          order: input.order,
          duration: video.length || null,
          captionUrl: null, // Captions are managed by Bunny
        },
      });

      return {
        material,
        bunnyVideoId: video.guid,
        thumbnailUrl: video.thumbnailUrl,
        status: video.status,
      };
    } catch (error) {
      // Cleanup on failure
      await bunnyStream.deleteVideo(video.guid);
      throw error;
    }
  }

  /**
   * Upload a document/audio/image to private storage
   * FR-MAT-03: File type validated server-side by content inspection
   * FR-MAT-07: Web renders in browser viewer, no download
   */
  async uploadDocument(
    instructorId: string,
    courseId: string,
    title: string,
    type: "document" | "audio",
    fileBuffer: Buffer,
    originalFilename: string,
    order: number = 0,
  ) {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only upload to your own courses");
    }

    // Validate size limits
    const maxSize = type === "audio" ? MAX_AUDIO_SIZE : MAX_DOCUMENT_SIZE;
    if (fileBuffer.length > maxSize) {
      throw new ValidationError(
        `${type} file exceeds ${maxSize / (1024 * 1024)}MB limit`,
      );
    }

    if (fileBuffer.length === 0) {
      throw new ValidationError("File is empty");
    }

    // Content-type inspection (FR-MAT-03)
    const detectedType = this.detectFileType(fileBuffer);
    const expectedType = type === "audio" ? "audio" : "document";

    if (detectedType !== expectedType) {
      throw new ValidationError(
        `File content does not match declared type (expected ${expectedType}, got ${detectedType})`,
      );
    }

    // Upload to private storage
    const key = storageService.generateKey(
      type === "audio" ? "course-audio" : "course-documents",
      originalFilename,
    );

    const contentType = type === "audio" ? "audio/mpeg" : "application/pdf";

    await storageService.uploadFile(fileBuffer, key, contentType);

    // Create material record
    const material = await prisma.material.create({
      data: {
        courseId,
        title,
        type,
        url: key,
        order,
      },
    });

    return material;
  }

  /**
   * Get signed URL for material access (short-expiry)
   * FR-MAT-05: No permanent URL ever exposed
   */
  async getSignedMaterialUrl(instructorId: string, materialId: string) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });

    if (!material) {
      throw new NotFoundError("Material not found");
    }

    if (material.course.instructorId !== instructorId) {
      throw new ForbiddenError("Access denied");
    }

    if (material.type === "video") {
      // Generate signed HLS URL
      const signedUrl = await bunnyStream.getSignedUrl(material.url, 3600);
      return { url: signedUrl, expiresIn: 3600 };
    }

    // Documents/audio — generate signed storage URL
    const signedUrl = await storageService.getSignedUrl(material.url, 3600);
    return { url: signedUrl, expiresIn: 3600 };
  }

  async getCourseMaterials(courseId: string) {
    return prisma.material.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        type: true,
        duration: true,
        order: true,
        createdAt: true,
      },
    });
  }

  async update(
    instructorId: string,
    materialId: string,
    input: UpdateMaterialInput,
  ) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });

    if (!material) {
      throw new NotFoundError("Material not found");
    }

    if (material.course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only update your own materials");
    }

    return prisma.material.update({
      where: { id: materialId },
      data: input,
    });
  }

  async delete(instructorId: string, materialId: string) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });

    if (!material) {
      throw new NotFoundError("Material not found");
    }

    if (material.course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only delete your own materials");
    }

    // Delete from Bunny if video
    if (material.type === "video") {
      await bunnyStream.deleteVideo(material.url);
    }

    // Delete from storage if document/audio
    if (material.type === "document" || material.type === "audio") {
      await storageService.deleteFile(material.url);
    }

    await prisma.material.delete({
      where: { id: materialId },
    });
  }

  /**
   * Detect file type by magic bytes (server-side content inspection)
   */
  private detectFileType(
    buffer: Buffer,
  ): "audio" | "document" | "image" | "unknown" {
    if (buffer.length < 4) return "unknown";

    // Check for PDF
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return "document";
    }

    // Check for MP3 (ID3 tag)
    if (
      (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) || // ID3
      (buffer.length >= 2 &&
        buffer[0] === 0xff &&
        buffer[1] !== undefined &&
        (buffer[1] & 0xe0) === 0xe0) // MPEG sync
    ) {
      return "audio";
    }

    // Check for PNG
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "image";
    }

    // Check for JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image";
    }

    return "unknown";
  }
}

export const materialService = new MaterialService();
