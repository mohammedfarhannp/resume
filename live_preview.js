import('./scripts/server.mjs').then(({ startServer }) => {
  const port = Number(process.env.PORT || process.argv[2] || 4173);
  startServer({ port });
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
