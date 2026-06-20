#!/usr/bin/env ts-node

/**
 * Syncs the version from package.json to Safari Info.plist files
 */

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { APP_CONFIG } from '../lib/appConfig';
import { WORKSPACE_ROOT } from '../lib/paths';

const PACKAGE_JSON_PATH = path.join(WORKSPACE_ROOT, 'package.json');
const HOST_APP_PLIST = path.join(WORKSPACE_ROOT, 'safari', 'HostApp', 'Info.plist');
const EXTENSION_PLIST = path.join(WORKSPACE_ROOT, 'safari', 'Extension', 'Info.plist');
const PROJECT_YML = path.join(WORKSPACE_ROOT, 'safari', 'project.yml');

function updatePlistVersion(plistPath: string, version: string): void {
  if (!fs.existsSync(plistPath)) {
    console.warn(`Warning: ${plistPath} not found, skipping.`);
    return;
  }

  let content = fs.readFileSync(plistPath, 'utf-8');

  // Update CFBundleShortVersionString
  const versionRegex = /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*/;
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, `$1${version}`);
    console.log(`Updated CFBundleShortVersionString in ${path.basename(plistPath)}`);
  } else {
    console.warn(`Warning: CFBundleShortVersionString not found in ${path.basename(plistPath)}`);
  }

  fs.writeFileSync(plistPath, content);
}

function updateProjectYmlVersion(ymlPath: string, version: string, buildNumber?: number): void {
  if (!fs.existsSync(ymlPath)) {
    console.warn(`Warning: ${ymlPath} not found, skipping.`);
    return;
  }

  let content = fs.readFileSync(ymlPath, 'utf-8');

  // Update MARKETING_VERSION
  const versionRegex = /(MARKETING_VERSION:\s*)[^\n]*/;
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, `$1${version}`);
    console.log(`Updated MARKETING_VERSION in project.yml`);
  } else {
    console.warn(`Warning: MARKETING_VERSION not found in project.yml`);
  }

  if (buildNumber !== undefined) {
    const buildRegex = /(CURRENT_PROJECT_VERSION:\s*)['"]?\d+['"]?/;
    if (!buildRegex.test(content)) {
      throw new Error('CURRENT_PROJECT_VERSION not found in project.yml');
    }
    content = content.replace(buildRegex, `$1'${buildNumber}'`);
    console.log(`Updated CURRENT_PROJECT_VERSION to ${buildNumber}`);
  }

  fs.writeFileSync(ymlPath, content);
}

function updateProjectMetadata(ymlPath: string): void {
  if (!fs.existsSync(ymlPath)) {
    return;
  }

  let content = fs.readFileSync(ymlPath, 'utf-8');

  content = content.replace(/^name: .*$/m, `name: ${APP_CONFIG.displayName}`);
  content = content.replace(
    /^  bundleIdPrefix: .*$/m,
    `  bundleIdPrefix: ${APP_CONFIG.bundleIdPrefix}`,
  );
  content = content.replace(
    /CFBundleDisplayName: .* Extension/g,
    `CFBundleDisplayName: ${APP_CONFIG.extensionDisplayName}`,
  );
  content = content.replace(
    /CFBundleDisplayName: (?!.* Extension).*$/gm,
    `CFBundleDisplayName: ${APP_CONFIG.displayName}`,
  );

  fs.writeFileSync(ymlPath, content);
}

async function main(): Promise<void> {
  const argv = await yargs
    .option('build-number', {
      type: 'number',
      description: 'Set an explicit positive build number',
    })
    .option('increment-build', {
      type: 'boolean',
      default: false,
      description: 'Increment CURRENT_PROJECT_VERSION by one',
    })
    .check((args) => {
      if (args['build-number'] !== undefined && args['increment-build']) {
        throw new Error('Choose either --build-number or --increment-build, not both.');
      }
      if (args['build-number'] !== undefined && args['build-number'] < 1) {
        throw new Error('--build-number must be a positive integer.');
      }
      return true;
    })
    .parse();

  console.log('Syncing version to Safari project...');

  // Read version from package.json
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.error(`Error: package.json not found at ${PACKAGE_JSON_PATH}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  const version = packageJson.version;

  if (!version) {
    console.error('Error: No version found in package.json');
    process.exit(1);
  }

  console.log(`Version from package.json: ${version}`);

  const projectYml = fs.readFileSync(PROJECT_YML, 'utf-8');
  const currentBuildMatch = projectYml.match(/CURRENT_PROJECT_VERSION:\s*['"]?(\d+)['"]?/);
  if (!currentBuildMatch) {
    throw new Error('CURRENT_PROJECT_VERSION not found in project.yml');
  }
  const currentBuild = Number(currentBuildMatch[1]);
  const requestedBuild = argv['build-number'];
  if (requestedBuild !== undefined && !Number.isInteger(requestedBuild)) {
    throw new Error('--build-number must be an integer.');
  }
  const buildNumber = argv['increment-build'] ? currentBuild + 1 : requestedBuild;

  // Update Info.plist files
  updatePlistVersion(HOST_APP_PLIST, version);
  updatePlistVersion(EXTENSION_PLIST, version);

  // Update project.yml
  updateProjectYmlVersion(PROJECT_YML, version, buildNumber);
  updateProjectMetadata(PROJECT_YML);

  console.log(`Version sync complete: ${version} (${buildNumber ?? currentBuild})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
