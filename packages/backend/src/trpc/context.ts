import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { Server as SocketIOServer } from 'socket.io';
import { db } from '../db';

export const createContext = (
  opts: CreateExpressContextOptions,
  io: SocketIOServer
) => {
  return {
    req: opts.req,
    res: opts.res,
    db,
    io,
  };
};

export type Context = ReturnType<typeof createContext>;
