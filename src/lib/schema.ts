import faqData from '../content/faq.json';
import metaData from '../content/meta.json';
import siteData from '../content/site.json';

const BASE_URL = metaData.siteMeta.baseUrl;

function toAbsolute(path: string): string {
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ name: 'Главная', path: '/' }],
  '/price': [
    { name: 'Главная', path: '/' },
    { name: 'Цены', path: '/price' },
  ],
  '/galery': [
    { name: 'Главная', path: '/' },
    { name: 'Портфолио', path: '/galery' },
  ],
  '/partnership': [
    { name: 'Главная', path: '/' },
    { name: 'Партнёрам', path: '/partnership' },
  ],
  '/contacts': [
    { name: 'Главная', path: '/' },
    { name: 'Контакты', path: '/contacts' },
  ],
  '/privacy': [
    { name: 'Главная', path: '/' },
    { name: 'Политика конфиденциальности', path: '/privacy' },
  ],
};

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: metaData.siteMeta.siteName,
    url: BASE_URL,
    logo: toAbsolute('/images/sunlife_logo.webp'),
    telephone: siteData.phone,
    email: siteData.email,
    sameAs: [siteData.vk.href, siteData.telegram.href, siteData.whatsapp.href],
  };
}

export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#localbusiness`,
    name: metaData.siteMeta.siteName,
    image: toAbsolute('/images/og-home.jpg'),
    url: BASE_URL,
    telephone: siteData.phone,
    email: siteData.email,
    priceRange: '₽₽',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Ленина, 70',
      addressLocality: 'Уфа',
      addressRegion: 'Республика Башкортостан',
      addressCountry: 'RU',
      postalCode: '450000',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '54.7388',
      longitude: '55.9721',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '22:00',
      },
    ],
  };
}

export function getServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE_URL}/#service`,
    serviceType: 'Фотосъёмка выписки из роддома',
    provider: {
      '@type': 'LocalBusiness',
      name: metaData.siteMeta.siteName,
      url: BASE_URL,
      telephone: siteData.phone,
    },
    areaServed: {
      '@type': 'City',
      name: 'Уфа',
    },
    description:
      'Профессиональная фотосъёмка выписки новорожденного в роддомах Уфы и других городов.',
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/price`,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function getFAQPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.categories.customer.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function getBreadcrumbListSchema(pathname: string) {
  const items = breadcrumbMap[pathname] ?? breadcrumbMap['/'];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsolute(item.path),
    })),
  };
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: metaData.siteMeta.siteName,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/galery?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
