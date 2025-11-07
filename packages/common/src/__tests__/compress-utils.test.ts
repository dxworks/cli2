import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unzip } from '../compress-utils.js';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import archiver from 'archiver';
import { createWriteStream } from 'node:fs';

describe('compress-utils', () => {
  let testDir: string;
  let zipPath: string;

  beforeEach(async () => {
    // Create a temporary directory for tests
    testDir = mkdtempSync(path.join(tmpdir(), 'compress-utils-test-'));
    zipPath = path.join(testDir, 'test.zip');

    // Create a test zip file with some content
    await createTestZip(zipPath);
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  async function createTestZip(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      // Add some test files to the zip
      archive.append('Hello World!', { name: 'test-root/file1.txt' });
      archive.append('Test content', { name: 'test-root/subfolder/file2.txt' });
      archive.directory('test-root/empty-dir/', false);

      archive.finalize();
    });
  }

  describe('unzip', () => {
    it('should extract zip file to destination', async () => {
      const extractPath = path.join(testDir, 'extracted');
      mkdirSync(extractPath, { recursive: true });

      await unzip(zipPath, { path: extractPath });

      // Add a small delay to ensure files are fully written
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(existsSync(path.join(extractPath, 'test-root/file1.txt'))).toBe(
        true,
      );
      expect(
        existsSync(path.join(extractPath, 'test-root/subfolder/file2.txt')),
      ).toBe(true);
    });

    it('should overwrite root directory when specified', async () => {
      const extractPath = path.join(testDir, 'extracted-custom');
      mkdirSync(extractPath, { recursive: true });

      await unzip(zipPath, {
        path: extractPath,
        overwriteRootDir: 'new-root',
      });

      expect(existsSync(path.join(extractPath, 'new-root/file1.txt'))).toBe(
        true,
      );
      expect(
        existsSync(path.join(extractPath, 'new-root/subfolder/file2.txt')),
      ).toBe(true);
      expect(existsSync(path.join(extractPath, 'test-root'))).toBe(false);
    });

    it('should create directories if they do not exist', async () => {
      const extractPath = path.join(testDir, 'extracted-new-dir');

      await unzip(zipPath, { path: extractPath });

      expect(existsSync(extractPath)).toBe(true);
      expect(existsSync(path.join(extractPath, 'test-root'))).toBe(true);
    });

    it('should reject on invalid zip file', async () => {
      const invalidZipPath = path.join(testDir, 'invalid.zip');
      writeFileSync(invalidZipPath, 'This is not a zip file');

      const extractPath = path.join(testDir, 'extracted-invalid');
      mkdirSync(extractPath, { recursive: true });

      await expect(
        unzip(invalidZipPath, { path: extractPath }),
      ).rejects.toThrow();
    });
  });
});
