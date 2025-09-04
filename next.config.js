/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/collections', destination: '/notebooks', permanent: true },
      { source: '/collections/:path*', destination: '/notebooks', permanent: true },
    ]
  },
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com', 'ytimg.com'],
    unoptimized: true,
  },
}

module.exports = nextConfig
