import { Express } from 'express';
import { Server } from 'http';

export interface IServer {
  start: (port: number) => void;
  Server: Server;
  App: Express;
}
