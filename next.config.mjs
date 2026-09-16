/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export → deployable to Cloudflare Pages (and any static host).
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: false },
  // Baked once at build time so the footer's "Updated <date>" reflects each
  // deploy (not the visitor's clock). Pinned to UTC when displayed.
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};
export default nextConfig;
