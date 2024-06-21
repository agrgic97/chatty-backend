import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '@global/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import JWT from 'jsonwebtoken';

export class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.');
    }

    try {
      req.currentUser = JWT.verify(req.session.jwt, process.env.JWT_TOKEN!) as AuthPayload;
    } catch (error) {
      throw new NotAuthorizedError('Invalid token. Please login again.');
    }
    next();
  }

  public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('You are not authorized to access this route.');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
