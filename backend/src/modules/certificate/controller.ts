import type { Request, Response, NextFunction } from "express";
import { certificateService } from "#/modules/certificate/service";
import { sendSuccess } from "#/shared/response";
import { z } from "zod";

const issueCertificateSchema = z.object({
  learnerProfileId: z.string().uuid(),
  courseId: z.string().uuid(),
});

const revokeCertificateSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(1000),
});

export class CertificateController {
  issueAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = issueCertificateSchema.parse(req.body);
      const certificate = await certificateService.issueAttendanceCertificate(
        input.learnerProfileId,
        input.courseId,
      );
      sendSuccess(res, certificate, 201, "Attendance certificate issued");
    } catch (error) {
      next(error);
    }
  };

  issueCompletion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = issueCertificateSchema.parse(req.body);
      const certificate = await certificateService.issueCompletionCertificate(
        input.learnerProfileId,
        input.courseId,
      );
      sendSuccess(res, certificate, 201, "Completion certificate issued");
    } catch (error) {
      next(error);
    }
  };

  getLearnerCertificates = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const certificates = await certificateService.getLearnerCertificates(
        req.params["learnerProfileId"] as string,
      );
      sendSuccess(res, certificates, 200);
    } catch (error) {
      next(error);
    }
  };

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const certificate = await certificateService.verifyCertificate(
        req.params["code"] as string,
      );

      if (certificate.revokedAt) {
        sendSuccess(
          res,
          {
            ...certificate,
            status: "REVOKED",
          },
          200,
        );
        return;
      }

      sendSuccess(
        res,
        {
          ...certificate,
          status: "VALID",
        },
        200,
      );
    } catch (error) {
      next(error);
    }
  };

  revoke = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const input = revokeCertificateSchema.parse(req.body);
      const certificate = await certificateService.revokeCertificate(
        adminId,
        req.params["id"] as string,
        input.reason,
      );
      sendSuccess(res, certificate, 200, "Certificate revoked");
    } catch (error) {
      next(error);
    }
  };
}

export const certificateController = new CertificateController();
