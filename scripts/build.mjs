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
await cp('Asset', `${outputDirectory}/Asset`, { recursive: true });

console.log(`Portfolio built in ${outputDirectory}/`);
