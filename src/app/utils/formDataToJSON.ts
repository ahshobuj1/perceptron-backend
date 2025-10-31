import { NextFunction, Request, Response } from 'express';

export const formDataToJSON = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if req.body.data exists before parsing
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  next();
};
