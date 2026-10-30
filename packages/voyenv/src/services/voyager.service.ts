import { Octokit } from 'octokit';
import cliProgress from 'cli-progress';
const { Presets, SingleBar } = cliProgress;
import path from 'node:path';
import * as fs from 'node:fs';
import {
  defaultOctokit,
  downloadFile,
  isNotNullNorUndefined,
  log,
  unzip,
} from '@dxworks/common';
import {
  configFile,
  doctorFile,
  dxworks,
  missionFile,
  voyager,
  voyagerAssetName,
} from '../constants.js';
import { getAssetFile } from '../utils.js';
import semver, { rcompare, SemVer } from 'semver';

export class VoyagerService {
  private octokit: Octokit;
  private readonly directory: string;

  constructor(octokit: Octokit, directory = '.') {
    this.octokit = octokit;
    this.directory = directory;
  }

  public async downloadAndInstallVoyager(
    voyagerVersion: string,
    voyagerAsset?: string,
  ): Promise<void> {
    const release = await this.octokit.rest.repos.getReleaseByTag({
      owner: dxworks,
      repo: voyager,
      tag: voyagerVersion,
    });

    const progressBar = new SingleBar(
      {
        format: 'voyager: {action} [{bar}] {percentage}% | ETA: {eta}s',
      },
      Presets.shades_classic,
    );

    // The asset named in voyenv.yml, or the release's first file
    const asset = voyagerAsset
      ? release.data.assets.find((it) => it.name === voyagerAsset)
      : release.data.assets[0];
    if (!asset)
      throw new Error(
        `Asset ${voyagerAsset} not found in Voyager release ${voyagerVersion}`,
      );

    const voyagerArchive = await downloadFile(
      asset.browser_download_url,
      path.resolve(this.directory, voyagerAssetName),
      { action: 'Downloading' },
      progressBar,
    );
    progressBar?.update({ action: 'Unzipping' });
    await unzip(voyagerArchive, {
      path: this.directory,
      overwriteRootDir: voyager,
    });
    fs.rmSync(voyagerArchive);
    const voyagerDir = path.join(this.directory, voyager);
    fs.rmSync(path.resolve(voyagerDir, 'instruments'), {
      recursive: true,
      force: true,
    });
    fs.readdirSync(voyagerDir).forEach((file) =>
      fs.cpSync(
        path.resolve(voyagerDir, file),
        path.resolve(this.directory, file),
        {
          recursive: true,
        },
      ),
    );
    fs.rmSync(voyagerDir, { recursive: true, force: true });
    // The engine zip's own files win; the defaults only fill in what it lacks
    [
      ['install/default-config.yml', configFile],
      ['install/default-doctor.yml', doctorFile],
      ['install/default-mission.yml', missionFile],
    ].forEach(([asset, file]) => {
      const target = path.resolve(this.directory, file);
      if (!fs.existsSync(target)) fs.cpSync(getAssetFile(asset), target);
    });
    fs.chmodSync(path.resolve(this.directory, 'voyager.sh'), '755');
    progressBar.stop();
  }
}

export async function getLatestVoyagerVersion(): Promise<string> {
  log.info('Computing latest Voyager version...');
  const { data } = await defaultOctokit.rest.repos.listReleases({
    owner: 'dxworks',
    repo: 'voyager',
  });
  const tag = data
    .map((it) => it.tag_name)
    .filter((it) => it.startsWith('v') && semver.valid(it))
    .map((it) => semver.parse(it))
    .filter((it) => it)
    .sort((v1, v2) => rcompare(v1 as SemVer, v2 as SemVer))
    .find(isNotNullNorUndefined)?.raw;
  if (tag == null) return 'v1.5.0';
  return tag;
}
