import { SingleBar } from 'cli-progress';
import { createWriteStream, unlinkSync } from 'node:fs';
import axios from 'axios';

/**
 * Download a file from a URL with optional progress tracking
 * @param url - The URL to download from
 * @param filename - The destination filename
 * @param payload - Optional payload data to pass to progress bar
 * @param progressBar - Optional progress bar instance
 * @returns Promise resolving to the filename
 */
export async function downloadFile(
  url: string,
  filename: string,
  payload?: Record<string, unknown>,
  progressBar?: SingleBar,
): Promise<string> {
  const file = createWriteStream(filename, 'utf-8');
  let receivedBytes = 0;

  const { data, headers, status } = await axios.get(url, {
    method: 'GET',
    responseType: 'stream',
  });

  const totalBytes = headers['content-length'] ? +headers['content-length'] : 0;

  return new Promise((resolve, reject) => {
    if (status !== 200) {
      return reject(new Error('Response status was ' + status));
    }

    progressBar?.start(totalBytes, 0, payload);

    data
      .on('data', (chunk: Buffer) => {
        receivedBytes += chunk.length;
        progressBar?.update(receivedBytes, payload);
      })
      .pipe(file)
      .on('finish', () => {
        file.close();
        resolve(filename);
      })
      .on('error', (err: Error) => {
        unlinkSync(filename);
        progressBar?.stop();
        return reject(err);
      });
  });
}

/**
 * Format bytes as human-readable text.
 *
 * @param bytes - Number of bytes
 * @param si - True to use metric (SI) units (powers of 1000), false for binary (IEC) units (powers of 1024)
 * @param dp - Number of decimal places to display
 * @returns Formatted string
 */
export function humanFileSize(bytes: number, si = false, dp = 1): string {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
}
