import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// 🎯 Forzamos a Node a leer el archivo .env de la raíz
dotenv.config();

export default defineConfig({
  datasource: {
    // Ahora process.env ya no será undefined
    url: process.env.DATABASE_URL,
  },
});