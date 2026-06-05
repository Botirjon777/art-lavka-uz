import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  allowedDevOrigins: [
    "192.168.0.41",
    "725a-91-196-77-111.ngrok-free.app",
    "b935-91-196-77-111.ngrok-free.app",
  ],
};

export default nextConfig;
