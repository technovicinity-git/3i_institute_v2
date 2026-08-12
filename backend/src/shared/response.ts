import type { Response } from "express";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  res.status(statusCode).json(response);
}

function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
): void {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };

  res.status(200).json(response);
}

export { sendSuccess, sendPaginated };
export type { ApiResponse };
