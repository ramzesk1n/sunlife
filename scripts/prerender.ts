import Prerenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import fs from 'fs/promises';
import path from 'path';

const routes = ['/', '/price', '/galery', '/partnership', '/contacts', '/privacy'];

async function getCriticalAssetPaths(): Promise<{ js: string[]; css: string }> {
  const assetsDir = path.resolve('./dist/assets');
  const files = await fs.readdir(assetsDir);

  const runtime = files.find((f) => f.startsWith('rolldown-runtime-') && f.endsWith('.js'));
  const vendor = files.find((f) => f.startsWith('vendor-') && f.endsWith('.js'));
  const index = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));

  const js = [runtime, vendor, index]
    .filter((f): f is string => Boolean(f))
    .map((f) => `/assets/${f}`);

  const css = files.find((f) => f.startsWith('index-') && f.endsWith('.css'));

  return { js, css: css ? `/assets/${css}` : '' };
}

async function prerender() {
  const { js: criticalJs, css: criticalCss } = await getCriticalAssetPaths();

  const prerenderer = new Prerenderer({
    staticDir: path.resolve('./dist'),
    renderer: new PuppeteerRenderer({
      renderAfterTime: 3000,
    }),
    server: {
      port: 45678,
    },
  });

  await prerenderer.initialize();

  const renderedRoutes = await prerenderer.renderRoutes(routes);

  for (const route of renderedRoutes) {
    const outputDir = path.join('./dist', route.route);
    await fs.mkdir(outputDir, { recursive: true });

    // Fix absolute URLs from prerender server
    let html = route.html;
    html = html.replace(/http:\/\/127\.0\.0\.1:45678\//g, '/');
    html = html.replace(/http:\/\/localhost:45678\//g, '/');

    // Remove all modulepreload links (we'll add only critical ones)
    html = html.replace(/<link rel="modulepreload"[^>]*>\n?/g, '');

    // Add critical modulepreloads after <head>
    const criticalPreloads = criticalJs
      .map((src) => `<link rel="modulepreload" crossorigin href="${src}">`)
      .join('');
    html = html.replace('<head>', `<head>${criticalPreloads}`);

    // Defer non-critical CSS to avoid render-blocking
    if (criticalCss) {
      const escapedCss = criticalCss.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(
        new RegExp(`<link rel="stylesheet" crossorigin="" href="${escapedCss}">`),
        `<link rel="preload" as="style" href="${criticalCss}">` +
        `<link rel="stylesheet" href="${criticalCss}" media="print" onload="this.media='all'">` +
        `<noscript><link rel="stylesheet" href="${criticalCss}"></noscript>`
      );
    }

    await fs.writeFile(path.join(outputDir, 'index.html'), html);
  }

  await prerenderer.destroy();
  console.log(`Prerendered ${routes.length} routes successfully.`);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
