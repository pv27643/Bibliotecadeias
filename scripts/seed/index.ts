import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

const seeds = [
  'seed-aspect-ratio.ts',
  'seed-atmospheric-effects.ts',
  'seed-backgrounds.ts',
  'seed-camera-profiles.ts',
  'seed-cinematografia.ts',
  'seed-director-signatures.ts',
  'seed-hands-models.ts',
  'seed-lighting-setups.ts',
  'seed-motion-camera.ts',
  'seed-ugc-poses.ts',
];

for (const seed of seeds) {
  console.log(`\n▶ ${seed}`);
  const result = spawnSync('npx', ['tsx', resolve(__dir, seed)], { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`❌ ${seed} falhou`);
    process.exit(1);
  }
  console.log(`✅ ${seed} concluído`);
}

console.log('\n✅ Todos os seeds executados com sucesso.');
