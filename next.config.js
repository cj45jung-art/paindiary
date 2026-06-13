/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress warnings about external images for custom products
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
