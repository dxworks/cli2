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
            entry.pipe(createWriteStream(fullPathName));
          }
        })
        .on('finish', () => {
          resolve();
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
