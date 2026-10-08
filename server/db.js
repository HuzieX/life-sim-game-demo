require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

module.exports = { prisma };
