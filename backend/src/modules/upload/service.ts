import { cloudinary } from "#/lib/cloudinary";
import { prisma } from "#/lib/prisma";
import { NotFoundError, ValidationError } from "#/shared/errors";

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  thumbnailUrl?: string;
}

export class UploadService {
  async uploadImage(
    accountId: string,
    buffer: Buffer,
    mimetype: string,
    _originalFilename: string,
    folder: string = "general",
  ): Promise<UploadResult> {
    if (
      !ALLOWED_FILE_TYPES.includes(mimetype) &&
      mimetype !== "application/pdf"
    ) {
      throw new ValidationError(
        "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF",
      );
    }

    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new ValidationError("File size exceeds 5MB limit");
    }

    if (buffer.length === 0) {
      throw new ValidationError("File is empty");
    }

    const folderPath = `${folder}/${accountId}`;
    const resourceType = mimetype === "application/pdf" ? "raw" : "image";

    const result = await new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: resourceType,
          ...(resourceType === "image"
            ? {
                transformation: [
                  { quality: "auto:good" },
                  { fetch_format: "auto" },
                ],
              }
            : {}),
          context: {
            uploadedBy: accountId,
          },
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Upload failed — no result"));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width ?? 0,
            height: result.height ?? 0,
            format: result.format ?? "pdf",
            size: result.bytes,
          });
        },
      );

      uploadStream.end(buffer);
    });

    return result;
  }
  /**
   * Core upload method with validation
   */
  private async uploadToCloudinary(
    buffer: Buffer,
    mimetype: string,
    folderPath: string,
    accountId: string,
    options: {
      width?: number;
      height?: number;
      crop?: "fill" | "fit" | "limit" | "thumb";
    } = {},
  ): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(mimetype)) {
      throw new ValidationError(
        "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF",
      );
    }

    // Validate file size
    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new ValidationError("Image size exceeds 5MB limit");
    }

    if (buffer.length === 0) {
      throw new ValidationError("Image file is empty");
    }

    // Build transformation
    const transformation: any[] = [
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ];

    if (options.width || options.height) {
      transformation.unshift({
        width: options.width,
        height: options.height,
        crop: options.crop ?? "fill",
        gravity: "face",
      });
    }

    const result = await new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: "image",
          transformation,
          context: {
            uploadedBy: accountId,
          },
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Upload failed — no result"));
            return;
          }

          // Generate thumbnail URL (200x200 cropped)
          const thumbnailUrl = cloudinary.url(result.public_id, {
            width: 200,
            height: 200,
            crop: "fill",
            gravity: "face",
            quality: "auto:good",
            fetch_format: "auto",
            secure: true,
          });

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
            thumbnailUrl,
          });
        },
      );

      uploadStream.end(buffer);
    });

    return result;
  }

  /**
   * Upload instructor profile photo
   * Also updates the instructor's photo in database
   */
  async uploadInstructorPhoto(
    accountId: string,
    buffer: Buffer,
    mimetype: string,
    _originalFilename: string,
  ): Promise<UploadResult> {
    const folderPath = `instructors/${accountId}`;

    const result = await this.uploadToCloudinary(
      buffer,
      mimetype,
      folderPath,
      accountId,
      { width: 400, height: 400, crop: "fill" },
    );

    // Update user record with photo URL
    await prisma.user
      .update({
        where: { id: accountId },
        data: { avatarUrl: result.url },
      })
      .catch(() => {
        // User might not have avatarUrl field — ignore
      });

    return result;
  }

  /**
   * Upload learner profile avatar
   * Also updates the learner profile record
   */
  async uploadLearnerProfileAvatar(
    accountId: string,
    learnerProfileId: string,
    buffer: Buffer,
    mimetype: string,
    _originalFilename: string,
  ): Promise<UploadResult> {
    // Verify profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    const folderPath = `profiles/${accountId}/${learnerProfileId}`;

    const result = await this.uploadToCloudinary(
      buffer,
      mimetype,
      folderPath,
      accountId,
      { width: 400, height: 400, crop: "fill" },
    );

    // Update learner profile with avatar URL
    await prisma.learnerProfile.update({
      where: { id: learnerProfileId },
      data: { avatarUrl: result.url },
    });

    return result;
  }

  /**
   * Upload account profile image
   * Updates user record
   */
  async uploadAccountImage(
    accountId: string,
    buffer: Buffer,
    mimetype: string,
    _originalFilename: string,
  ): Promise<UploadResult> {
    const folderPath = `accounts/${accountId}`;

    const result = await this.uploadToCloudinary(
      buffer,
      mimetype,
      folderPath,
      accountId,
      { width: 400, height: 400, crop: "fill" },
    );

    // Update user with avatar URL
    await prisma.user
      .update({
        where: { id: accountId },
        data: { avatarUrl: result.url },
      })
      .catch(() => {
        // Ignore if field doesn't exist
      });

    return result;
  }

  /**
   * Upload course thumbnail
   * Also updates course record
   */
  async uploadCourseThumbnail(
    accountId: string,
    courseId: string,
    buffer: Buffer,
    mimetype: string,
    _originalFilename: string,
  ): Promise<UploadResult> {
    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== accountId) {
      throw new ValidationError(
        "You can only upload thumbnails for your own courses",
      );
    }

    const folderPath = `courses/${courseId}/thumbnail`;

    const result = await this.uploadToCloudinary(
      buffer,
      mimetype,
      folderPath,
      accountId,
      { width: 640, height: 360, crop: "fill" },
    );

    // Update course thumbnail
    await prisma.course.update({
      where: { id: courseId },
      data: { thumbnailUrl: result.url },
    });

    return result;
  }

  /**
   * Upload course cover image
   */
  async uploadCourseCoverImage(
    accountId: string,
    courseId: string,
    buffer: Buffer,
    mimetype: string,
    _originalFilename: string,
  ): Promise<UploadResult> {
    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== accountId) {
      throw new ValidationError(
        "You can only upload covers for your own courses",
      );
    }

    const folderPath = `courses/${courseId}/cover`;

    const result = await this.uploadToCloudinary(
      buffer,
      mimetype,
      folderPath,
      accountId,
      { width: 1200, height: 400, crop: "fill" },
    );

    // Update course cover
    await prisma.course.update({
      where: { id: courseId },
      data: { coverImageUrl: result.url },
    });

    return result;
  }

  /**
   * Delete image by public ID
   */
  async deleteImage(accountId: string, publicId: string): Promise<void> {
    // Security: verify the publicId belongs to this account
    if (!publicId.includes(accountId)) {
      throw new ValidationError("You can only delete your own images");
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  }
}

export const uploadService = new UploadService();
