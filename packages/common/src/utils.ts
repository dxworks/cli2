import { Octokit } from 'octokit';

/**
 * No-op function that does nothing
 */
export const noop = (): void => {
  // Intentionally empty
};

/**
 * Check if a value is not null or undefined
 * @param o - Value to check
 * @returns True if value is not null or undefined
 */
export function isNotNullNorUndefined(o: unknown): boolean {
  return typeof o !== 'undefined' && o !== null;
}

/**
 * Extract owner and repository name from a GitHub repository string
 * @param name - Repository string in format "owner/repo"
 * @returns Array with [owner, repo]
 */
export function extractOwnerAndRepo(name: string): string[] {
  return name.split('/');
}

/**
 * Default Octokit instance
 * Uses GH_TOKEN environment variable if available for authentication
 */
export const defaultOctokit: Octokit = process.env.GH_TOKEN
  ? new Octokit({
      auth: process.env.GH_TOKEN,
      userAgent: 'dxworks-cli',
    })
  : new Octokit({
      userAgent: 'dxworks-cli',
    });
