// src/config/prismaClient.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // (اختياري) إعدادات لتسجيل استعلامات قاعدة البيانات أثناء التطوير
  // log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;