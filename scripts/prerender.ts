import Prerenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import fs from 'fs/promises';
import path from 'path';

const routes = ['/', '/price', '/galery', '/partnership'];

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
    await fs.writeFile(path.join(outputDir, 'index.html'), route.html);
  }

  await prerenderer.destroy();
  console.log(`Prerendered ${routes.length} routes successfully.`);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
