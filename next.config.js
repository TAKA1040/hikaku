/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    const scriptSrc = [
      "script-src 'self' 'unsafe-inline'",
      // Dev only: Next.js React Refresh (HMR) requires eval
      isDev ? "'unsafe-eval'" : null,
    ].filter(Boolean).join(' ')

    const connectSrc = [
      "connect-src 'self'",
      "https://lkrndvcoyvvycyybuncp.supabase.co",
      "wss://lkrndvcoyvvycyybuncp.supabase.co",
      "wss://hikaku.apaf.me",
      // Dev only: allow arbitrary ws scheme for local HMR
      isDev ? 'ws:' : null,
    ].filter(Boolean).join(' ')

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs, Google avatars
      "img-src 'self' data: https://lh3.googleusercontent.com",
      connectSrc,
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