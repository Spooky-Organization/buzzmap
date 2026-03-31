import { Response } from "express";
import { PaginationMeta } from "../types";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  meta: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: any;
}

export class ResponseFactory {
  public static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  public static created<T>(res: Response, data: T, message: string = "Created successfully"): Response {
    return this.success(res, data, message, 201);
  }

  public static paginated<T>(
    res: Response,
    data: T,
    meta: PaginationMeta,
    message?: string
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      meta,
      message,
      timestamp: new Date().toISOString(),
    };
    return res.status(200).json(response);
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string,
    details?: any
  ): Response {
    const response: ErrorResponse = {
      success: false,
      error: error || message,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
    if (details) response.details = details;
    return res.status(statusCode).json(response);
  }

  public static notFound(res: Response, message: string = "Not found"): Response {
    return this.error(res, message, 404, "Not Found");
  }

  public static unauthorized(res: Response, message: string = "Unauthorized"): Response {
    return this.error(res, message, 401, "Unauthorized");
  }

  public static forbidden(res: Response, message: string = "Forbidden"): Response {
    return this.error(res, message, 403, "Forbidden");
  }

  public static serverError(res: Response, message: string = "Internal server error"): Response {
    return this.error(res, message, 500, "Internal Server Error");
  }

  public static badRequest(res: Response, message: string, details?: any): Response {
    return this.error(res, message, 400, "Bad Request", details);
  }

  public static conflict(res: Response, message: string): Response {
    return this.error(res, message, 409, "Conflict");
  }

  public static noContent(res: Response): Response {
    return res.status(204).send();
  }
}