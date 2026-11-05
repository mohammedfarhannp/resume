import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';

const outputDirectory = 'dist';

await build({
  entryPoints: ['src/App.jsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'Asset/dist/app.js',
  loader: { '.jsx': 'jsx' },
  jsx: 'automatic',
  target: ['es2020'],
  define: { 'process.env.NODE_ENV': '"production"' },
});

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp('index.html', `${outputDirectory}/index.html`);
await mkdir(`${outputDirectory}/Asset/dist`, { recursive: true });
await mkdir(`${outputDirectory}/Asset/img/projects`, { recursive: true });
await cp('Asset/dist', `${outputDirectory}/Asset/dist`, { recursive: true });
await cp('Asset/img/favicon.svg', `${outputDirectory}/Asset/img/favicon.svg`);
await cp('Asset/img/projects', `${outputDirectory}/Asset/img/projects`, { recursive: true });
await cp('Resume-2026-March-v2.pdf', `${outputDirectory}/Resume-Mohammed-Farhan-NP.pdf`);

console.log(`Portfolio built in ${outputDirectory}/`);
