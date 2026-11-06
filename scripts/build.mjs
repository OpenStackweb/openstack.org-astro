import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  siteBuildProfile,
  siteBuildStamp,
  fingerprintSiteBuild,
} from './lib/site-build-profile.mjs';
rmSync('dist/site-build-profile.json', { force: true });
rmSync('dist/server/wrangler.production.json', { force: true });
if (existsSync('.env')) process.loadEnvFile('.env');
const profile = siteBuildProfile(process.env.OPENSTACK_BUILD_PROFILE);
await import('./patch-tina-field-labels.mjs');
await import('./patch-tina-list-keyboard.mjs');
await import('./check-react-final-form.mjs');
const run = (args) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
};
run(['scripts/check-release-content.mjs']);
run(['scripts/check-editorial-routes.mjs']);
// Never publish Tina's local-mode editor (it targets a developer's localhost).
rmSync('public/admin', { recursive: true, force: true });
if (process.env.PUBLIC_TINA_CLIENT_ID && process.env.TINA_TOKEN) {
  run(['node_modules/@tinacms/cli/bin/tinacms', 'build']);
} else {
  console.log('TinaCloud credentials absent: building the site without the editor UI.');
}
run(['node_modules/astro/bin/astro.mjs', 'build']);

if (process.env.PUBLIC_TINA_CLIENT_ID) {
  const path = 'dist/server/wrangler.json';
  const config = JSON.parse(readFileSync(path, 'utf8'));
  config.vars = { ...config.vars, PUBLIC_TINA_CLIENT_ID: process.env.PUBLIC_TINA_CLIENT_ID };
  writeFileSync(path, JSON.stringify(config, null, 2));
}
writeFileSync(
  'dist/site-build-profile.json',
  JSON.stringify(siteBuildStamp(profile.name, await fingerprintSiteBuild()), null, 2) + '\n',
);
