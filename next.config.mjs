/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "export",
  experimental: {
    // swcMinify: false,
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    // disableOptimizedLoading: true,
  },
  // experimental: {
  //   serverComponentsExternalPackages: ["@react-pdf/renderer"],
  // },
};

export default nextConfig;
