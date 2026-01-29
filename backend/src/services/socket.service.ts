import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("SocketService");

let io: Server;

const parseCookies = (cookieString: string) => {
  return cookieString.split(";").reduce(
    (res, item) => {
      const data = item.trim().split("=");
      return { ...res, [data[0]]: data[1] };
    },
    {} as Record<string, string>,
  );
};

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = parseCookies(socket.request.headers.cookie || "");
    const token = cookies.accessToken;

    if (token) {
      jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error("Authentication error"));
        socket.data.userId = (decoded as { userId: string }).userId;
        next();
      });
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    logger.debug("Client connected:", { socketId: socket.id });

    const userId = socket.data.userId as string;
    if (userId) {
      void socket.join(`user:${userId}`);
      logger.debug(`User joined room`, { userId, room: `user:${userId}` });
    }

    socket.on("join-ticket", (ticketId: string) => {
      void socket.join(`ticket:${ticketId}`);
      logger.debug(`Socket joined ticket`, { socketId: socket.id, ticketId });
    });

    socket.on("leave-ticket", (ticketId: string) => {
      void socket.leave(`ticket:${ticketId}`);
      logger.debug(`Socket left ticket`, { socketId: socket.id, ticketId });
    });

    socket.on("disconnect", () => {
      logger.debug("Client disconnected:", { socketId: socket.id });
    });

    // Ticket List Room
    socket.on("join-tickets-list", () => {
      void socket.join("tickets:list");
      logger.debug(`Socket joined tickets:list`, { socketId: socket.id });
    });

    socket.on("leave-tickets-list", () => {
      void socket.leave("tickets:list");
      logger.debug(`Socket left tickets:list`, { socketId: socket.id });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitTicketUpdate = (ticketId: string, data: any) => {
  if (io) {
    io.to(`ticket:${ticketId}`).emit("ticket:update", data);
  }
};

export const emitNotification = (userId: string, notification: any) => {
  if (io) {
    io.to(`user:${userId}`).emit("notification:new", notification);
  }
};

export const emitTicketListUpdate = (data: any) => {
  if (io) {
    io.to("tickets:list").emit("tickets:list:update", data);
  }
};
