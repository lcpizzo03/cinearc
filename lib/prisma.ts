import { PrismaClient } from "@prisma/client";

const globalPrismaDB = globalThis as unknown as { prisma: PrismaClient };

export const prismaDB = globalPrismaDB.prisma || new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalPrismaDB.prisma = prismaDB;