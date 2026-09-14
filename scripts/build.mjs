import './patch-react-final-form.mjs';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
if (existsSync('.env')) process.loadEnvFile('.env');
const run = (args) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
};
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
