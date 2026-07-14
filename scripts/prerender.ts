import Prerenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import fs from 'fs/promises';
import path from 'path';

const routes = ['/', '/price', '/galery', '/partnership', '/contacts', '/privacy'];

async function prerender() {
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
    
    await fs.writeFile(path.join(outputDir, 'index.html'), html);
  }

  await prerenderer.destroy();
  console.log(`Prerendered ${routes.length} routes successfully.`);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
