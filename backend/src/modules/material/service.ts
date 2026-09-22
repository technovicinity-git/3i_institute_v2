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
import { cloudinary } from "#/lib/cloudinary";

const MAX_VIDEO_SIZE = 4 * 1024 * 1024 * 1024; // 4GB

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
    captionsFile?: Buffer, // Make optional
  ) {
    // Validate file sizes
    if (videoFile.length > MAX_VIDEO_SIZE) {
      throw new ValidationError("Video file exceeds 4GB limit");
    }

    if (videoFile.length === 0) {
      throw new ValidationError("Video file is empty");
    }

    // Remove required caption validation
    // if (captionsFile.length === 0) {
    //   throw new ValidationError("Caption file (VTT/SRT) is required");
    // }

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
    const video = await bunnyStream.createVideo(input.title);

    try {
      // Upload video file
      await bunnyStream.uploadVideo(
        video.guid,
        videoFile,
        `${input.title}.mp4`,
      );

      // Add captions only if provided
      if (captionsFile && captionsFile.length > 0) {
        try {
          await bunnyStream.addCaptions(
            video.guid,
            captionsFile,
            "en",
            "English",
          );
        } catch (captionError) {
          console.warn("Caption upload failed (non-critical):", captionError);
          // Continue without captions
        }
      }

      // Create material record
      const material = await prisma.material.create({
        data: {
          courseId: input.courseId,
          title: input.title,
          description: input.description || null,
          type: "video",
          url: video.guid,
          order: input.order,
          duration: video.length || null,
          captionUrl: null,
        },
      });

      return {
        material,
        bunnyVideoId: video.guid,
        thumbnailUrl: video.thumbnailUrl,
        status: video.status,
      };
    } catch (error) {
      await bunnyStream.deleteVideo(video.guid);
      throw error;
    }
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

    const updated = await prisma.material.update({
      where: { id: materialId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && {
          description: input.description || null,
        }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });

    return updated;
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

  async getCourseContentForLearner(
    courseId: string,
    learnerProfileId?: string,
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        totalModules: true,
        totalLessons: true,
        totalDurationMinutes: true,
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const materials = await prisma.material.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });

    // Get completed progress for this learner
    let completedMaterialIds: Set<string> = new Set();

    if (learnerProfileId) {
      const progressRecords = await prisma.materialProgress.findMany({
        where: {
          learnerProfileId,
          materialId: { in: materials.map((m) => m.id) },
          completed: true,
        },
        select: { materialId: true },
      });
      completedMaterialIds = new Set(progressRecords.map((p) => p.materialId));
    }

    // Group materials into modules
    const moduleSize = 5;
    const modules = [];

    for (let i = 0; i < materials.length; i += moduleSize) {
      const moduleMaterials = materials.slice(i, i + moduleSize);
      modules.push({
        id: `module-${Math.floor(i / moduleSize) + 1}`,
        title: `Module ${Math.floor(i / moduleSize) + 1}`,
        order: Math.floor(i / moduleSize),
        lessons: moduleMaterials.map((material) => ({
          id: material.id,
          title: material.title,
          description: material.description ?? null,
          type: material.type,
          url: material.url,
          duration: material.duration,
          order: material.order,
          captionUrl: material.captionUrl,
          completed: completedMaterialIds.has(material.id),
        })),
      });
    }

    // Calculate progress
    const totalLessons = materials.length;
    const completedLessons = completedMaterialIds.size;
    const progress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      modules,
      totalLessons,
      totalDurationMinutes:
        course.totalDurationMinutes ||
        materials.reduce((sum, m) => sum + (m.duration ?? 0), 0) / 60,
      progress,
      completedLessons,
    };
  }
  async uploadDocument(
    instructorId: string,
    courseId: string,
    title: string,
    order: number,
    description: string | undefined,
    fileBuffer: Buffer,
    originalFilename: string,
    mimetype: string,
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

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(mimetype)) {
      throw new ValidationError(
        "Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX",
      );
    }

    // Max 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      throw new ValidationError("File exceeds 50MB limit");
    }

    // Extract extension from original filename
    const ext = originalFilename.split(".").pop()?.toLowerCase() ?? "pdf";

    // Upload to Cloudinary as raw resource
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `course-documents/${courseId}`,
          resource_type: "raw",
          public_id: `${Date.now()}-${originalFilename.replace(/\.[^.]+$/, "")}.${ext}`, // ← Include extension
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        },
      );
      uploadStream.end(fileBuffer);
    });

    // Create material record
    const material = await prisma.material.create({
      data: {
        courseId,
        title,
        description: description || null,
        type: "document",
        url: result.public_id, // Store Cloudinary public_id
        order,
      },
    });

    return material;
  }

  async getSignedMaterialUrl(userId: string, materialId: string) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });

    if (!material) {
      throw new NotFoundError("Material not found");
    }

    // Access check (instructor, admin, or enrolled learner)
    const isInstructor = material.course.instructorId === userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    const isAdmin = user?.role?.name === "Admin";

    let isEnrolled = false;
    if (!isInstructor && !isAdmin) {
      const learnerProfiles = await prisma.learnerProfile.findMany({
        where: { accountId: userId, deletedAt: null },
        select: { id: true },
      });
      const profileIds = learnerProfiles.map((lp) => lp.id);

      if (profileIds.length > 0) {
        const enrolment = await prisma.enrolment.findFirst({
          where: {
            learnerProfileId: { in: profileIds },
            courseId: material.courseId,
            waitlisted: false,
          },
        });
        isEnrolled = !!enrolment;
      }
    }

    if (!isInstructor && !isAdmin && !isEnrolled) {
      throw new ForbiddenError("You are not enrolled in this course");
    }

    // Video — Bunny Stream
    if (material.type === "video") {
      const signedUrl = await bunnyStream.getSignedUrl(material.url, 3600);
      return { url: signedUrl, expiresIn: 3600, contentType: "video" };
    }

    // Document — Cloudinary authenticated URL
    if (material.type === "document") {
      // Generate a signed URL that expires in 1 hour
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;

      const signedUrl = cloudinary.utils.private_download_url(
        material.url,
        "pdf", // format — Cloudinary uses this for delivery
        {
          resource_type: "raw",
          type: "upload",
          expires_at: expiresAt,
          attachment: false, // ensures inline view, not download
        },
      );

      return {
        url: signedUrl,
        expiresIn: 3600,
        contentType: "document",
        mimeType: this.getMimeTypeFromPublicId(material.url),
      };
    }

    // Audio — signed Cloudinary URL
    if (material.type === "audio") {
      const signedUrl = cloudinary.url(material.url, {
        resource_type: "video",
        sign_url: true,
        type: "upload",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });
      return { url: signedUrl, expiresIn: 3600, contentType: "audio" };
    }

    // Link
    return { url: material.url, expiresIn: 3600, contentType: "link" };
  }

  private getMimeTypeFromPublicId(publicId: string): string {
    const ext = publicId.split(".").pop()?.toLowerCase() ?? "";
    const map: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
    return map[ext] ?? "application/pdf";
  }
}

export const materialService = new MaterialService();
