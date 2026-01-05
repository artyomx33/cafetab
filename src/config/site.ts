export const siteConfig = {
  name: 'CafeTab',
  description: 'Universal tab management for cafes, restaurants, and hospitality',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  companyName: 'CafeTab',
  supportEmail: 'support@cafetab.com',
  links: {
    twitter: 'https://twitter.com/cafetab',
    github: 'https://github.com/cafetab',
  },
}

export type SiteConfig = typeof siteConfig
