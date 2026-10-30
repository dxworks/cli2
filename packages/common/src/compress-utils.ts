import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
} from 'node:fs';
import * as unzipper from 'unzipper';
import path from 'node:path';

export interface UnzipOptions {
  path: string;
  overwriteRootDir?: string;
}

/**
 * Replace everything before the first occurrence of a separator with a new value
 * @param str - The string to process
 * @param separator - The separator to search for
 * @param replacement - The replacement value
 * @returns The processed string
 */
function replaceBefore(
  str: string,
  separator: string,
  replacement: string,
): string {
  const index = str.indexOf(separator);
  if (index === -1) return str;
  return replacement + str.substring(index);
}

/**
 * Unzip a file to a directory
 * @param zipFileName - Path to the zip file
 * @param options - Unzip options including destination path and optional root directory override
 * @returns Promise that resolves when extraction is complete
 */
export async function unzip(
  zipFileName: string,
  options?: UnzipOptions,
): Promise<void> {
  // The permissions stored in the zip (unix zips only), so programs stay executable
  const modes = new Map<string, number>();
  if (options?.overwriteRootDir) {
    const directory = await unzipper.Open.file(zipFileName);
    directory.files.forEach((file) => {
      const mode = (file.externalFileAttributes >>> 16) & 0o777;
      if (file.versionMadeBy >> 8 === 3 && mode) modes.set(file.path, mode);
    });
  }
  const writes: Promise<unknown>[] = [];
  return new Promise((resolve, reject) => {
    if (options?.overwriteRootDir) {
      createReadStream(zipFileName)
        .pipe(unzipper.Parse())
        .on('entry', function (entry: unzipper.Entry) {
          const fullPathName = path.resolve(
            options.path,
            replaceBefore(entry.path, '/', options.overwriteRootDir!),
          );
          if (entry.type === 'Directory') {
            if (!existsSync(fullPathName)) {
              mkdirSync(fullPathName, { recursive: true });
            }
            entry.autodrain();
          } else {
            // Ensure parent directory exists
            const parentDir = path.dirname(fullPathName);
            if (!existsSync(parentDir)) {
              mkdirSync(parentDir, { recursive: true });
            }
            const file = createWriteStream(fullPathName, {
              mode: modes.get(entry.path),
            });
            writes.push(
              new Promise((done, fail) =>
                file.on('close', () => done(undefined)).on('error', fail),
              ),
            );
            entry.pipe(file);
          }
        })
        .on('finish', () => {
          // Resolve only once every file is fully written
          Promise.all(writes).then(() => resolve(), reject);
        })
        .on('error', reject);
    } else {
      createReadStream(zipFileName)
        .pipe(unzipper.Extract(options))
        .on('finish', () => {
          resolve();
        })
        .on('error', reject);
    }
  });
}
