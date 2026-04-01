import { InstrumentConfig } from '../model/voyenv.js';
import path from 'node:path';
import semver, { rcompare, SemVer } from 'semver';
import { Octokit } from 'octokit';
import cliProgress from 'cli-progress';
const { Format, MultiBar, Presets } = cliProgress;
type GenericFormatter = cliProgress.GenericFormatter;
type Options = cliProgress.Options;
type Params = cliProgress.Params;
import fs from 'node:fs';
import chalk from 'chalk';
import {
  downloadFile,
  extractOwnerAndRepo,
  humanFileSize,
  isNotNullNorUndefined,
  unzip,
} from '@dxworks/common';

interface TagDetails {
  tag: string | undefined;
  downloadUrl: string | undefined;
}

export class InstrumentService {
  private readonly instrumentsDir: string;
  private octokit: Octokit;

  constructor(octokit: Octokit, directory = '.') {
    this.octokit = octokit;
    this.instrumentsDir = path.resolve(directory, 'instruments');
    fs.mkdirSync(this.instrumentsDir, { recursive: true });
  }

  public async downloadInstruments(
    instruments: InstrumentConfig[],
  ): Promise<void> {
    const multiProgressBar = new MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: this.createFormatter(instruments),
      formatBar: Format.BarFormat,
      barCompleteChar: Presets.shades_classic.barCompleteChar,
      barIncompleteChar: Presets.shades_classic.barIncompleteChar,
    });
    await Promise.all(
      instruments.map((instrument) =>
        this.downloadAndUnzip(instrument, multiProgressBar),
      ),
    );
    multiProgressBar.stop();
  }

  private async downloadAndUnzip(
    instrument: InstrumentConfig,
    multiProgressBar: cliProgress.MultiBar,
  ) {
    const singleBar = multiProgressBar.create(100, 0, {
      name: instrument.name,
      state: 'Getting Version',
    });

    const tagDetails = await this.getTag(instrument);

    if (tagDetails && tagDetails.downloadUrl) {
      const instrumentFolder = `${instrument.name.replace('/', '.')}-${tagDetails.tag}`;
      const zipFileName = path.join(
        this.instrumentsDir,
        `${instrumentFolder}.zip`,
      );
      await downloadFile(
        tagDetails.downloadUrl,
        zipFileName,
        {
          name: instrument.name,
          state: 'Downloading',
        },
        singleBar,
      );
      singleBar?.update({ name: instrument.name, state: 'Unzipping' });
      await unzip(zipFileName, {
        path: path.resolve(this.instrumentsDir),
        overwriteRootDir: instrumentFolder,
      });
      fs.rmSync(zipFileName);
      singleBar?.update({ name: instrument.name, state: 'Done' });
    } else {
      singleBar?.update({ name: instrument.name, state: 'No release found' });
    }
  }

  private async getLatestInstrumentTag(
    instrument: InstrumentConfig,
  ): Promise<TagDetails | null> {
    const [owner, repo] = extractOwnerAndRepo(instrument.name);
    const { data } = await this.octokit.rest.repos.listReleases({
      owner,
      repo,
    });
    const tag = data
      .map((it) => it.tag_name)
      .filter(
        (it) =>
          it.startsWith('v') && it.endsWith('-voyager') && semver.valid(it),
      )
      .map((it) => semver.parse(it))
      .filter((it) => it)
      .sort((v1, v2) => rcompare(v1 as SemVer, v2 as SemVer))
      .find(isNotNullNorUndefined)?.raw;
    if (tag == null) return null;

    const downloadUrl = await this.getDownloadUrl(instrument, data, tag);

    return {
      tag,
      downloadUrl,
    };
  }

  private async getDownloadUrl(
    instrument: InstrumentConfig,
    releases: {
      tag_name: string;
      assets: { name: string; browser_download_url: string }[];
    }[],
    tag: string,
  ) {
    if (instrument.asset)
      return releases
        .find((it) => it.tag_name === tag)
        ?.assets.find((it) => it.name === instrument.asset)
        ?.browser_download_url;
    else {
      const [owner, repo] = extractOwnerAndRepo(instrument.name);

      return (
        await this.octokit.rest.repos.downloadZipballArchive({
          owner,
          repo,
          ref: tag,
        })
      ).url;
    }
  }

  private async getTag(
    instrumentConfig: InstrumentConfig,
  ): Promise<TagDetails | null> {
    if (instrumentConfig.tag === undefined) {
      return await this.getLatestInstrumentTag(instrumentConfig);
    } else {
      const [owner, repo] = extractOwnerAndRepo(instrumentConfig.name);
      const release = (
        await this.octokit.rest.repos.getReleaseByTag({
          owner,
          repo,
          tag: instrumentConfig.tag,
        })
      ).data;

      return {
        tag: instrumentConfig.tag,
        downloadUrl: await this.getDownloadUrl(
          instrumentConfig,
          [release],
          instrumentConfig.tag,
        ),
      };
    }
  }

  public createFormatter(instruments: InstrumentConfig[]): GenericFormatter {
    const maxNameLen = Math.max(...instruments.map((it) => it.name.length));
    return function (
      options: Options,
      params: Params,
      payload: { name: string; state: string },
    ) {
      const name = payload?.name ?? 'unknown';
      const state = payload?.state ?? 'unknown';
      const bar = options.formatBar?.call(null, params.progress, options) ?? '';
      const pct = (Math.floor(params.progress * 100) + '').padStart(3);
      const size = `${humanFileSize(params.value)} / ${humanFileSize(params.total)}`;
      const color = state === 'Done' ? chalk.green : chalk.yellow;
      return `${name.padEnd(maxNameLen)}: ${color(state.padEnd(15))} [${bar}] ${pct}% | ${size}`;
    };
  }
}
