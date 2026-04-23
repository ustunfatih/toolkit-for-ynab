#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { APP_CONFIG } from './lib/appConfig';
import { MANIFEST_PATH, WORKSPACE_ROOT } from './lib/paths';

const validOverrides = ['beta', 'development', 'ios', 'firefox', 'safari'] as const;

async function main() {
  const { type } = await yargs.choices('type', validOverrides).demandOption('type').parse();

  const manifest = require(MANIFEST_PATH);

  if (type === 'ios' || type === 'firefox' || type === 'safari') {
    delete manifest.host_permissions;
    delete manifest.action;
  }

  const changes = require(path.join(WORKSPACE_ROOT, 'src', `manifest.${type}.json`));

  // Clobber any keys in the beta manifest across.
  Object.assign(manifest, changes);

  const manifestName =
    type === 'beta'
      ? APP_CONFIG.betaDisplayName
      : type === 'development'
        ? APP_CONFIG.developmentDisplayName
        : APP_CONFIG.displayName;

  manifest.author = APP_CONFIG.author;
  manifest.name = manifestName;
  manifest.homepage_url = APP_CONFIG.homepageUrl;

  if (manifest.action) {
    manifest.action.default_title = APP_CONFIG.browserActionTitle;
  }

  if (manifest.browser_action) {
    manifest.browser_action.default_title = APP_CONFIG.browserActionTitle;
  }

  // If we're in a github action, append the build number to the version number.
  // if (process.env.GITHUB_RUN_NUMBER) {
  //   manifest.version += `.${process.env.GITHUB_RUN_NUMBER}`;
  //   console.log(`using version: ${manifest.version}`);
  // }

  // Delete the old one.
  fs.unlinkSync(MANIFEST_PATH);

  // And write our new one.
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`${type} manifest applied.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
