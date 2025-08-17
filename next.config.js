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
      // Scripts/styles: allow unsafe-inline for Next.js compatibility (hash-based CSP too brittle)
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs, Google avatars
      "img-src 'self' data: https://lh3.googleusercontent.com",
      // Connections: self, Supabase REST/Auth/Realtime (ws/wss), remove invalid wildcard
      "connect-src 'self' https://lkrndvcoyvvycyybuncp.supabase.co wss://lkrndvcoyvvycyybuncp.supabase.co wss://hikaku.apaf.me",
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