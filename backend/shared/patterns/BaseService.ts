import { ApiError } from "../../modules/auth_module/src/middleware/errorHandler";

export abstract class BaseService {
  protected notFound(resource: string, id?: string): never {
    throw new ApiError(`${resource} not found`, 404);
  }

  protected badRequest(message: string): never {
    throw new ApiError(message, 400);
  }

  protected conflict(message: string): never {
    throw new ApiError(message, 409);
  }

  protected unauthorized(message: string = "Unauthorized"): never {
    throw new ApiError(message, 401);
  }

  protected forbidden(message: string = "Forbidden"): never {
    throw new ApiError(message, 403);
  }

  protected serverError(message: string = "Internal server error"): never {
    throw new ApiError(message, 500);
  }

  protected validationError(message: string): never {
    throw new ApiError(message, 400);
  }

  protected async handlePrismaError(error: any): Promise<never> {
    if (error.code === "P2002") {
      throw new ApiError(`A record already exists with this value`, 409);
    }
    if (error.code === "P2025") {
      throw new ApiError(`Record not found`, 404);
    }
    throw new ApiError("Database operation failed", 400);
  }
}