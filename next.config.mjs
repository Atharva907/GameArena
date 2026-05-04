/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: process.env.NEXT_OUTPUT_MODE === "server" ? undefined : "standalone",
};

export default nextConfig;
