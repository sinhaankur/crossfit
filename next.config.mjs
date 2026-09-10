/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export → deployable to Cloudflare Pages (and any static host).
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: false },
};
export default nextConfig;
