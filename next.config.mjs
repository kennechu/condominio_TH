/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpila Material UI correctamente para el App Router de Next.js
  transpilePackages: ['@mui/material', '@mui/icons-material'],
};

export default nextConfig;