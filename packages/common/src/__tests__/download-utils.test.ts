import { describe, it, expect, vi, afterEach } from 'vitest';
import { humanFileSize, downloadFile } from '../download-utils.js';
import axios, { type AxiosRequestConfig } from 'axios';
import { Readable } from 'node:stream';
import { unlinkSync, existsSync } from 'node:fs';
import { type SingleBar } from 'cli-progress';

vi.mock('axios');

describe('download-utils', () => {
  describe('humanFileSize', () => {
    it('should format bytes correctly', () => {
      expect(humanFileSize(0)).toBe('0 B');
      expect(humanFileSize(123)).toBe('123 B');
      expect(humanFileSize(1023)).toBe('1023 B');
    });

    it('should format KiB correctly (binary)', () => {
      expect(humanFileSize(1024)).toBe('1.0 KiB');
      expect(humanFileSize(1536)).toBe('1.5 KiB');
      expect(humanFileSize(2048)).toBe('2.0 KiB');
    });

    it('should format MiB correctly (binary)', () => {
      expect(humanFileSize(1024 * 1024)).toBe('1.0 MiB');
      expect(humanFileSize(1.5 * 1024 * 1024)).toBe('1.5 MiB');
    });

    it('should format GiB correctly (binary)', () => {
      expect(humanFileSize(1024 * 1024 * 1024)).toBe('1.0 GiB');
    });

    it('should format KB correctly (SI units)', () => {
      expect(humanFileSize(1000, true)).toBe('1.0 kB');
      expect(humanFileSize(1500, true)).toBe('1.5 kB');
    });

    it('should format MB correctly (SI units)', () => {
      expect(humanFileSize(1000 * 1000, true)).toBe('1.0 MB');
      expect(humanFileSize(1.5 * 1000 * 1000, true)).toBe('1.5 MB');
    });

    it('should respect decimal places parameter', () => {
      expect(humanFileSize(1536, false, 2)).toBe('1.50 KiB');
      expect(humanFileSize(1536, false, 0)).toBe('2 KiB');
    });

    it('should handle negative bytes', () => {
      expect(humanFileSize(-1024)).toBe('-1.0 KiB');
      expect(humanFileSize(-100)).toBe('-100 B');
    });
  });

  describe('downloadFile', () => {
    const testFilename = '/tmp/test-download.txt';

    afterEach(() => {
      // Clean up test file if it exists
      if (existsSync(testFilename)) {
        unlinkSync(testFilename);
      }
    });

    it('should download file successfully', async () => {
      const mockStream = new Readable({
        read() {
          // No-op implementation
        },
      });
      mockStream.push('test content');
      mockStream.push(null);

      vi.mocked(axios.get).mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '12' },
        status: 200,
        statusText: 'OK',
        config: {} as AxiosRequestConfig,
      });

      const result = await downloadFile(
        'https://example.com/file.txt',
        testFilename,
      );

      expect(result).toBe(testFilename);
      expect(existsSync(testFilename)).toBe(true);
    });

    it('should reject when status is not 200', async () => {
      const mockStream = new Readable({
        read() {
          // No-op implementation
        },
      });

      vi.mocked(axios.get).mockResolvedValue({
        data: mockStream,
        headers: {},
        status: 404,
        statusText: 'Not Found',
        config: {} as AxiosRequestConfig,
      });

      await expect(
        downloadFile('https://example.com/notfound.txt', testFilename),
      ).rejects.toThrow('Response status was 404');
    });

    it('should call progress bar with correct values', async () => {
      const mockStream = new Readable({
        read() {
          // No-op implementation
        },
      });

      const chunk1 = Buffer.from('test');
      const chunk2 = Buffer.from(' content');

      // Push chunks asynchronously
      setImmediate(() => {
        mockStream.push(chunk1);
        mockStream.push(chunk2);
        mockStream.push(null);
      });

      const mockProgressBar = {
        start: vi.fn(),
        update: vi.fn(),
        stop: vi.fn(),
      } as unknown as SingleBar;

      vi.mocked(axios.get).mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '12' },
        status: 200,
        statusText: 'OK',
        config: {} as AxiosRequestConfig,
      });

      const payload = { filename: 'test.txt' };
      await downloadFile(
        'https://example.com/file.txt',
        testFilename,
        payload,
        mockProgressBar,
      );

      expect(mockProgressBar.start).toHaveBeenCalledWith(12, 0, payload);
      expect(mockProgressBar.update).toHaveBeenCalled();
    });
  });
});
