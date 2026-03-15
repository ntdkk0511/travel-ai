import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient();

const users = await prisma.user.findMany();

console.log(users);
