import { platform } from 'node:os';

export const OS = {
  WINDOWS: 'windows',
  LINUX: 'linux',
  MAC: 'mac',
  UNKNOWN: 'unknown',
} as const;

export type OsType = (typeof OS)[keyof typeof OS];

export const osType = getOsType();

function getOsType(): OsType {
  switch (platform()) {
    case 'darwin':
      return OS.MAC;
    case 'win32':
      return OS.WINDOWS;
    case 'linux':
      return OS.LINUX;
    default:
      return OS.UNKNOWN;
  }
}
