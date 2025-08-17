/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Scripts/styles: allow specific hashes for Next.js inline scripts (note: brittle; consider nonce-based CSP)
      "script-src 'self' 'sha256-Q+8tPsjVtiDsjF/Cv8FMOpg2Yg91oKFKDAJat1PPb2g=' 'sha256-6Tz3JVhQOhRJcz++zOuTr5ig5FKA5h6lvKa1VoP6awk=' 'sha256-F/+BKFqpWzyI4HZ2vm7xohyhK1KFfw86q1yUyDTESQ4=' 'sha256-tGGqBWl3liI+Q823DwOdS8adMXw3up/ZpEzxFYIrzKY=' 'sha256-VeHv/xWUJQ3bL/OrluKV1dp60wy9JB8heF94CQp3jo0=' 'sha256-tg1ROAQFcNSJi6dOCwfGqs5C3pTWnm4YIlri5GkW5S0=' 'sha256-WgWsFH6cO7F7tQNG6qhVjMxrh0qsMQSc+F01UWKBoT0=' 'sha256-MIN2coCClaWgoZ10I2xlQlcjJuDg21IYGhO47zqL39w='",
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs, Google avatars
      "img-src 'self' data: https://lh3.googleusercontent.com",
      // Connections: self, Supabase REST/Auth/Realtime (ws/wss), self-domain wss
      "connect-src 'self' https://lkrndvcoyvvycyybuncp.supabase.co wss://lkrndvcoyvvycyybuncp.supabase.co wss://hikaku.apaf.me wss://hikaku-*.vercel.app",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          // Enforce HTTPS (takes effect on HTTPS responses)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Security hardening
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.svg',
      },
    ]
  },
}

module.exports = nextConfig