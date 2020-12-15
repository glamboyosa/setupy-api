import { Request, Response } from 'express';
import { Stream } from 'stream';
export interface context {
  req: Request;
  res: Response;
}
// GraphQL Upload type
export interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}
