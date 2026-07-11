# CMS Architecture Plan for САН ЛАЙФ

## Context
- Static site: Vite + React + TypeScript + Tailwind CSS v4
- Build: `tsc -b && vite build && tsx scripts/prerender.ts` → static HTML in `dist/`
- 5 routes: `/`, `/price`, `/galery`, `/partnership`, `/privacy`
- All content currently hardcoded in `src/content/*.ts` files
- No runtime server, no API calls

## Goal
CMS that allows non-technical users to:
1. Create collections with photos + titles
2. Upload photos with auto-optimization (resize, WebP, srcset)
3. Edit prices, add new services
4. Edit any text on any page
5. Manage form submissions (CRM for leads)

---

## Option A: Strapi (Self-Hosted Headless CMS) — RECOMMENDED

### Why Strapi
- Open source, self-hosted (PostgreSQL + Node.js)
- Rich text editor, media library with image transformations
- Role-based access control (admin, editor, photographer)
- REST/GraphQL API for build-time fetching
- Plugin ecosystem (SEO, sitemap, forms)

### Architecture
```
Strapi CMS (self-hosted, e.g. on VPS or Railway)
  ├── PostgreSQL (content database)
  ├── Uploads folder or S3 (images)
  └── Admin panel (content editing)
         ↓ REST API at build time
Vite build pipeline:
  1. `npm run cms:sync` → fetches all collections from Strapi
  2. Generates `src/content/*.ts` files from API response
  3. Downloads images to `public/images/cms/`
  4. `tsc -b && vite build && tsx scripts/prerender.ts`
```

### Collections Schema
```
PricingPackage
  - id, name, price, currency, description, popular, note
  - Features (component, repeatable): text, highlight, warning
  - Gallery (media): icon image

FAQItem
  - id, question, answer, category (home | partnership)

Review
  - id, author, text, date, city, rating

TeamMember
  - id, name, role, photo (media), order

PortfolioProject
  - id, title, alt, photo (media), category

GalleryImage
  - id, title, alt, photo (media), order, page (home | partnership)

PageMeta
  - path, title, description, ogTitle, ogDescription, ogImage

ContactSubmission (CRM)
  - name, phone, contactMethod, hospital, date, consent, package, status, notes, createdAt
```

### Image Processing
Strapi has built-in Sharp integration:
- Auto-generate thumbnails, small, medium, large
- Format conversion (WebP, AVIF)
- URL format: `/uploads/medium_photo_abc123.webp`
- At build time, download all sizes and generate srcset

### Pros
- Full control over data and hosting
- No vendor lock-in
- Can extend with custom plugins
- Free (self-hosted)

### Cons
- Need server/VPS for Strapi (~$5-10/month)
- Need to manage PostgreSQL + backups
- More setup time initially

### Hosting Options
- Railway.app (~$5/month for PostgreSQL + Strapi)
- Hetzner VPS (~$4/month)
- Self-hosted on existing server

---

## Option B: Sanity (Cloud Headless CMS)

### Why Sanity
- Cloud-hosted, zero server management
- Excellent developer experience (TypeScript schemas)
- Real-time collaborative editing
- GROQ query language (powerful, like GraphQL but simpler)
- Image pipeline with auto-optimization (CDN + on-the-fly transforms)

### Architecture
```
Sanity Studio (cloud-hosted, custom domain)
  ├── Content Lake (cloud database)
  ├── Asset CDN (images optimized on-the-fly)
  └── GROQ API
         ↓ `npm run cms:sync` at build time
Vite build pipeline (same as Option A)
```

### Image Pipeline
Sanity's CDN is excellent:
- Upload once, get URL: `https://cdn.sanity.io/.../photo.jpg?w=800&fm=webp&q=80`
- No need to download images at build time — can use Sanity CDN URLs directly
- However, for SSG/prerender, we still need to fetch at build time or use CDN URLs in HTML

### Pricing
- Free tier: 3 users, 10GB assets, 200K API requests/month
- Growth: $15/month per user
- Pay-as-you-go for overages

### Pros
- Zero server management
- Best-in-class image CDN
- Real-time editing (multiple editors simultaneously)
- Excellent TypeScript support

### Cons
- Vendor lock-in (data export possible but not trivial)
- Costs scale with usage
- Less control than self-hosted

---

## Option C: Directus (Self-Hosted, SQL-First)

### Why Directus
- Open source, self-hosted
- SQL-first: works directly with your PostgreSQL/MySQL database
- Beautiful admin interface
- Built-in file storage with transformations
- REST/GraphQL API

### Architecture
Same as Strapi — self-hosted CMS + build-time sync.

### Pros
- SQL-native (no abstraction layer)
- Very clean admin UI
- Good performance

### Cons
- Smaller community than Strapi
- Fewer plugins

---

## Option D: Custom Admin Panel (React + Firebase/Supabase)

### Why Custom
- Full control over UX
- No CMS learning curve for the client
- Can tailor exactly to the business workflow

### Architecture
```
Custom Admin Panel (React app, separate repo or /admin route)
  ├── Firebase/Supabase (auth, database, storage)
  ├── Image processing (Cloudinary or Sharp on Firebase Functions)
  └── Form submissions (Firestore/Supabase table)
         ↓ REST API at build time
Vite build pipeline (same pattern)
```

### Pros
- Perfectly tailored UX
- Can integrate with existing services

### Cons
- Most development time
- Need to build everything from scratch
- Ongoing maintenance burden

---

## Option E: TinaCMS (Git-Based CMS)

### Why TinaCMS
- Git-based: content lives in the repo as Markdown/JSON
- Visual editing directly on the site (sidebar editor)
- Works with static site generators
- Free for personal/small projects

### Architecture
```
TinaCMS Cloud (or self-hosted)
  ├── Git repository (content as Markdown/JSON files)
  ├── Tina Cloud (auth, media)
  └── Visual editing interface
         ↓ Content is already in repo
Vite build pipeline (no sync needed — content is in repo)
```

### Pros
- Content is code (version control, PRs, rollback)
- Visual editing on the actual site
- No database to manage

### Cons
- Not ideal for large media libraries
- Git-based workflow may confuse non-technical users
- Limited for complex relational data

---

## Recommendation

**Primary: Strapi (Option A)**
- Best balance of features, control, and cost
- Self-hosted = no vendor lock-in
- Rich media library with image transformations
- Can handle all collections + CRM for submissions
- Mature ecosystem, good documentation

**Alternative: Sanity (Option B)** if:
- Want zero server management
- Willing to pay for convenience
- Need real-time collaborative editing
- Image CDN performance is critical

---

## Implementation Phases

### Phase 1: Strapi Setup + Content Migration
1. Deploy Strapi (Railway/Hetzner)
2. Define all collections (pricing, faq, reviews, team, projects, gallery, meta)
3. Create admin user roles (super admin, content editor, photographer)
4. Migrate current hardcoded content into Strapi
5. Build `cms:sync` script that fetches from Strapi API and generates `src/content/*.ts`

### Phase 2: Image Pipeline
1. Configure Strapi media library with Sharp
2. Define image transformation presets (thumbnail, medium, large, hero)
3. Update Gallery/Hero/Team components to use CMS image URLs or downloaded files
4. Implement lazy loading with srcset

### Phase 3: CRM for Form Submissions
1. Create `ContactSubmission` collection in Strapi
2. Build API endpoint for form submission (POST /api/contact-submissions)
3. Add validation, spam filtering (honeypot, rate limit)
4. Admin dashboard: view submissions, filter by status, export to CSV
5. Email notifications (Strapi Email plugin or custom)

### Phase 4: Admin Panel Polish
1. Custom Strapi admin views (dashboard with stats)
2. Preview functionality (see changes before publishing)
3. Scheduled publishing (draft → publish at specific time)
4. Multi-language support (if needed later)

---

## Technical Details: Build-Time Sync Script

```typescript
// scripts/cms-sync.ts
import fs from 'fs/promises';
import path from 'path';

async function syncFromStrapi() {
  const apiUrl = process.env.STRAPI_API_URL;
  const token = process.env.STRAPI_API_TOKEN;

  // Fetch all collections
  const [pricing, faq, reviews, team, projects, gallery, meta] = await Promise.all([
    fetch(`${apiUrl}/api/pricing-packages?populate=*`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`${apiUrl}/api/faq-items?populate=*`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    // ... etc
  ]);

  // Generate TypeScript files
  await fs.writeFile(
    'src/content/pricing.ts',
    `export const pricingPackages = ${JSON.stringify(pricing.data, null, 2)} as const;`
  );

  // Download images
  for (const item of gallery.data) {
    const imageUrl = item.attributes.photo.data.attributes.url;
    const imageData = await fetch(`${apiUrl}${imageUrl}`).then(r => r.arrayBuffer());
    await fs.writeFile(`public/images/cms/${item.id}.webp`, Buffer.from(imageData));
  }
}

syncFromStrapi();
```

Build pipeline becomes:
```bash
npm run cms:sync   # Fetch from Strapi, generate content files, download images
npm run build      # tsc + vite build + prerender
```

---

## Cost Estimate

| Component | Option A (Strapi) | Option B (Sanity) |
|-----------|-------------------|-------------------|
| CMS hosting | $5-10/month (Railway/VPS) | $0-15/month (free tier → growth) |
| Database | Included in hosting | Included |
| Image storage | Included or S3 ($1-5/month) | 10GB free, then $1/GB |
| CDN | Cloudflare free | Sanity CDN included |
| Domain | $10-15/year | $10-15/year |
| **Total** | **$6-15/month** | **$0-20/month** |

---

## Next Steps

1. **Choose CMS** (Strapi recommended)
2. **Set up Strapi instance** (Railway or local dev)
3. **Define exact schema** for all collections
4. **Build sync script** (cms-sync.ts)
5. **Migrate existing content**
6. **Update components** to use CMS data
7. **Add CRM collection** for form submissions
8. **Test build pipeline end-to-end**
