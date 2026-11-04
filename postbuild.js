import fs from 'node:fs';
import path from 'node:path';

const SPA_ROUTES = [
  'say-hi',
  'contact',
  'my-builds',
  'gallery',
  'my-story',
  'about',
  'my-lab',
  'wispr-flow'
];

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  // 1. Generate 404.html fallback for Vercel
  fs.writeFileSync(path.join(distDir, '404.html'), indexHtml);
  console.log('✓ Generated dist/404.html SPA fallback');

  // 2. Generate static directory with index.html for direct 200 OK serving
  for (const route of SPA_ROUTES) {
    const routeDir = path.join(distDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);
  }
  console.log(`✓ Generated static route HTML for: ${SPA_ROUTES.join(', ')}`);
} else {
  console.warn('Warning: dist/index.html not found, skipped SPA route generation.');
}
