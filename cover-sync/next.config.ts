import type { Configuration } from "webpack";
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    // Add fallback for node modules
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve?.fallback,
      fs: false,
      net: false,
      tls: false,
      "supports-color": false,
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/_not-found",
        destination: "/404",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
