import { config } from './config.js';
import { createServer } from './server.js';
import { startFanoutWorker } from './workers/fanout.js';
import { startPlatformWorkers } from './workers/platform.js';
import type { Platform } from './types.js';

async function main() {
  const platforms = config.activePlatforms as Platform[];
  console.log(`[social-worker] starting — active platforms: [${platforms.join(', ')}]`);

  // Start the fanout worker
  const fanoutWorker = startFanoutWorker();

  // Start one worker per active platform
  const platformWorkers = startPlatformWorkers(platforms);

  // Start the webhook HTTP server
  const app = createServer();
  const server = app.listen(config.server.port, () => {
    console.log(`[social-worker] webhook server listening on :${config.server.port}`);
  });

  // Graceful shutdown
  async function shutdown(signal: string) {
    console.log(`[social-worker] ${signal} received — shutting down…`);
    server.close();
    await Promise.all([
      fanoutWorker.close(),
      ...platformWorkers.map((w) => w.close()),
    ]);
    process.exit(0);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[social-worker] fatal:', err);
  process.exit(1);
});
