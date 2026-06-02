/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'howbazaar-images.b-cdn.net' },
      { protocol: 'https', hostname: 'bpp-static.bazaarplusplus.com' },
      { protocol: 'https', hostname: 'bazaar-builds.net' },
      { protocol: 'https', hostname: 'cwlgghqlqvpbmfuvkvle.supabase.co' },
      { protocol: 'https', hostname: 'clan.cloudflare.steamstatic.com' },
      { protocol: 'https', hostname: 'cdn.cloudflare.steamstatic.com' },
      { protocol: 'https', hostname: '**.akamaihd.net' },
      { protocol: 'https', hostname: '**.howbazaar.gg' }
    ]
  }
};

export default nextConfig;
