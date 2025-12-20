/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
        // Optional: You can also configure various image optimization settings
        // formats: ['image/webp', 'image/avif'],
        // minimumCacheTTL: 60,
    },
    // Add any other Next.js config options you need
};

module.exports = nextConfig; 