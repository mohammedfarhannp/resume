import { startServer } from './server.mjs';

const port = Number(process.env.PORT || process.argv[2] || 4173);
startServer({ port });
