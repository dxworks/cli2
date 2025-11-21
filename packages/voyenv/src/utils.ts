import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
export const _package = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

export function getAssetFile(assetName: string): string {
  return path.join(__dirname, 'assets', assetName);
}
