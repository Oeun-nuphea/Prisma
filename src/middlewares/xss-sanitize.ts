import xss from 'xss';
import { Request, Response, NextFunction } from 'express';

const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = JSON.parse(xss(JSON.stringify(req.body)));
  }
  next();
};

export default sanitizeRequest;