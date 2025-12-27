export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/', '/settings/', '/onboarding/', '/auth/'],
        },
        sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://applyos.pro'}/sitemap.xml`,
    }
}
