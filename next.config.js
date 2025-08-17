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
      // Scripts/styles: avoid 'unsafe-inline' for scripts; allow inline styles for Tailwind JIT if needed
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs, Google avatars
      "img-src 'self' data: https://lh3.googleusercontent.com",
      // Connections: self, Supabase REST/Auth/Realtime (ws/wss)
      "connect-src 'self' https://lkrndvcoyvvycyybuncp.supabase.co wss://lkrndvcoyvvycyybuncp.supabase.co",
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
}

module.exports = nextConfig