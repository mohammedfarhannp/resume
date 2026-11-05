import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'index.html',
  'Asset/dist/app.js',
  'Asset/dist/app.css',
  'dist/Resume-Mohammed-Farhan-NP.pdf',
  'src/data/projects.json',
  'Resume-2026-March-v2.pdf',
];

for (const file of requiredFiles) {
  await access(path.join(projectRoot, file));
}

const projects = await readFile(path.join(projectRoot, 'src/data/projects.json'), 'utf8').then(JSON.parse);

if (projects.length !== 5) throw new Error(`Expected 5 resume projects, found ${projects.length}`);
for (const project of projects) {
  if (!project.title || !project.description || !project.image || !project.tech?.length) {
    throw new Error(`Incomplete project entry: ${project.title || '(untitled)'}`);
  }
}

console.log(`Resume portfolio check passed: ${projects.length} projects and build files present.`);
