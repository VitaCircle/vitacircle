/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@vitacircle/shared"],
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${process.env.API_URL || "http://localhost:4000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
