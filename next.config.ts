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
  allowedDevOrigins: ["192.168.0.41"],
  // Canonical domain is artlavka.uz — permanently redirect the legacy
  // art-lavka.uz domain (and www variants) so SEO authority consolidates
  // on a single host.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "art-lavka.uz" }],
        destination: "https://artlavka.uz/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.art-lavka.uz" }],
        destination: "https://artlavka.uz/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.artlavka.uz" }],
        destination: "https://artlavka.uz/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
