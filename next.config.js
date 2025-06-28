/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Genkit instrumentation uses native Node.js packages that aren't
    // compatible with Webpack. This configuration prevents Webpack
    // from trying to bundle them.
    serverComponentsExternalPackages: [
      '@opentelemetry/api',
      '@opentelemetry/sdk-node',
    ],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tb-static.uber.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
