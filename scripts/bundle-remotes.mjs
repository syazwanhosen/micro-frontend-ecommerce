/**
 * Copies each built remote into the host's output so a single static deploy
 * serves the whole system:
 *
 *   host/dist/assets/…            the shell
 *   host/dist/catalog/assets/…    remote-catalog, reachable at /catalog
 *   host/dist/cart/assets/…       remote-cart,    reachable at /cart
 *   host/dist/checkout/assets/…   remote-checkout at /checkout
 *
 * The remotes are still built independently and the host still only knows a
 * URL — this step just decides that the URL happens to be same-origin. Point
 * VITE_REMOTE_<NAME> at a separate deployment and this step becomes optional.
 */
import { cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hostDist = join(root, 'host', 'dist');
const REMOTES = ['catalog', 'cart', 'checkout'];

if (!existsSync(hostDist)) {
  throw new Error('host/dist is missing — build the host before bundling remotes.');
}

for (const name of REMOTES) {
  const from = join(root, `remote-${name}`, 'dist');
  if (!existsSync(from)) {
    throw new Error(`remote-${name}/dist is missing — run "npm run build -w remote-${name}" first.`);
  }
  const to = join(hostDist, name);
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(`bundled remote-${name} → host/dist/${name}`);
}
