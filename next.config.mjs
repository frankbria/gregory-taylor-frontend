/** @type {import('next').NextConfig} */
// frontend/next.config.js
const nextConfig = {
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? {
          fallback: [
            {
              source: '/api/:path*',
              destination: 'http://localhost:4010/api/:path*',
            },
          ],
        }
      : { fallback: [] }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

