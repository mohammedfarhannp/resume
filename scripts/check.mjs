import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'index.html',
  'Asset/dist/app.js',
  'Asset/dist/app.css',
  'src/data/projects.json',
  'src/data/brands.json',
];

for (const file of requiredFiles) {
  await access(path.join(projectRoot, file));
}

const [projects, brands] = await Promise.all([
  readFile(path.join(projectRoot, 'src/data/projects.json'), 'utf8').then(JSON.parse),
  readFile(path.join(projectRoot, 'src/data/brands.json'), 'utf8').then(JSON.parse),
]);

if (projects.length !== 116) throw new Error(`Expected 116 projects, found ${projects.length}`);
if (brands.length !== 18) throw new Error(`Expected 18 brands, found ${brands.length}`);

console.log(`Portfolio check passed: ${projects.length} projects, ${brands.length} brands, and build files present.`);
