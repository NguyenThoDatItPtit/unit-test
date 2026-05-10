import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      user_id: number;
      email: string;
      role_id: number;
    };
  }
}

// types/express.d.ts
declare namespace Express {
  interface Request {
    fileMeta?: {
      originalName: string;
      filename: string;
      path: string;
      hash: string;
      size: number;
      duplicated: boolean;
    };
  }
}
