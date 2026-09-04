/**
 * Copies each built remote into the host's output so a single static deploy
 * serves the whole system:
 *
 *   dist/assets/…            the shell
 *   dist/catalog/assets/…    remote-catalog, reachable at /catalog
 *   dist/cart/assets/…       remote-cart,    reachable at /cart
 *   dist/checkout/assets/…   remote-checkout at /checkout
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
const outDir = join(root, 'dist');
const REMOTES = ['catalog', 'cart', 'checkout'];

if (!existsSync(outDir)) {
  throw new Error('dist/ is missing — build the host before bundling remotes.');
}

for (const name of REMOTES) {
  const from = join(root, `remote-${name}`, 'dist');
  if (!existsSync(from)) {
    throw new Error(`remote-${name}/dist is missing — run "npm run build -w remote-${name}" first.`);
  }
  const to = join(outDir, name);
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(`bundled remote-${name} → dist/${name}`);
}
