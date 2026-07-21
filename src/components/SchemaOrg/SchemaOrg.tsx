import {
  getBreadcrumbListSchema,
  getFAQPageSchema,
  getLocalBusinessSchema,
  getOrganizationSchema,
  getServiceSchema,
  getWebsiteSchema,
} from '../../lib/schema';

interface SchemaOrgProps {
  pathname: string;
}

function JsonLd({ data }: { data: unknown }) {
  // Escape "<" so a "</script>" inside CMS-edited JSON cannot break out of the tag
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}

export default function SchemaOrg({ pathname }: SchemaOrgProps) {
  const isHome = pathname === '/';

  return (
    <>
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getLocalBusinessSchema()} />
      <JsonLd data={getWebsiteSchema()} />
      <JsonLd data={getBreadcrumbListSchema(pathname)} />
      {isHome && <JsonLd data={getServiceSchema()} />}
      {isHome && <JsonLd data={getFAQPageSchema()} />}
    </>
  );
}
