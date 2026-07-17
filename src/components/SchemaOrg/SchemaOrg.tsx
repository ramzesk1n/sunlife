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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
