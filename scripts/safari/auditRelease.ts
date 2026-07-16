#!/usr/bin/env ts-node

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { APP_CONFIG } from '../lib/appConfig';
import { WORKSPACE_ROOT } from '../lib/paths';

const EXPECTED_HOST = 'com.ustunfatih.toolkitforynab';
const EXPECTED_EXTENSION = `${EXPECTED_HOST}.Extension`;
const EXPECTED_DOMAIN = 'https://app.ynab.com/*';

function read(relativePath: string): string {
  return fs.readFileSync(path.join(WORKSPACE_ROOT, relativePath), 'utf-8');
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(command: string, args: string[]): void {
  console.log(`> ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, { cwd: WORKSPACE_ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}`);
}

function auditSource(): void {
  const project = read('safari/project.yml');
  const safariManifest = JSON.parse(read('src/manifest.safari.json'));
  const privacyManifest = read('safari/HostApp/PrivacyInfo.xcprivacy');
  const packageJson = JSON.parse(read('package.json'));
  const xcodeProject = read('safari/Toolkit for YNAB.xcodeproj/project.pbxproj');
  const requestedDomains = safariManifest.permissions.filter((permission: string) =>
    permission.startsWith('http'),
  );

  assert(APP_CONFIG.hostBundleIdentifier === EXPECTED_HOST, 'Unexpected host bundle identifier');
  assert(
    APP_CONFIG.extensionBundleIdentifier === EXPECTED_EXTENSION,
    'Unexpected extension bundle identifier',
  );
  assert(project.includes(`PRODUCT_BUNDLE_IDENTIFIER: ${EXPECTED_HOST}\n`), 'Host ID missing');
  assert(
    project.includes(`PRODUCT_BUNDLE_IDENTIFIER: ${EXPECTED_EXTENSION}\n`),
    'Extension ID missing',
  );
  assert(!project.includes('CODE_SIGN_IDENTITY'), 'project.yml hardcodes a signing identity');
  assert(!project.includes('DEVELOPMENT_TEAM'), 'project.yml hardcodes a developer team');
  assert(
    !xcodeProject.includes('CODE_SIGN_IDENTITY = "-"'),
    'Generated project uses ad-hoc signing',
  );
  assert(!xcodeProject.includes('23BJ9QDJAH'), 'Generated project contains the stale team ID');
  assert(
    requestedDomains.length === 1 && requestedDomains[0] === EXPECTED_DOMAIN,
    `Safari permissions must contain only ${EXPECTED_DOMAIN}`,
  );
  assert(
    JSON.stringify(safariManifest.content_scripts).includes(EXPECTED_DOMAIN) &&
      !JSON.stringify(safariManifest.content_scripts).includes('youneedabudget.com'),
    'Safari content scripts contain an unexpected host',
  );
  assert(
    !privacyManifest.includes('NSPrivacyCollectedDataTypes'),
    'Privacy manifest declares collected data',
  );
  assert(
    !/raven|sentry/i.test(read('src/core/background/background.js')),
    'Telemetry remains enabled',
  );
  assert(
    !/raven|sentry/i.test(JSON.stringify(packageJson.dependencies ?? {})),
    'Telemetry dependency found',
  );
  assert(!read('src/manifest.json').includes('fatihustun/'), 'Base manifest uses a stale fork URL');
  assert(
    project.includes(`MARKETING_VERSION: ${packageJson.version}`),
    'Xcode marketing version does not match package.json',
  );

  console.log('Release source audit passed.');
}

async function main(): Promise<void> {
  const argv = await yargs
    .option('app', {
      type: 'string',
      description: 'Also verify a notarized .app bundle',
    })
    .parse();

  auditSource();

  if (argv.app) {
    const appPath = path.resolve(argv.app);
    assert(fs.existsSync(appPath), `App not found: ${appPath}`);
    run('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath]);
    run('spctl', ['--assess', '--type', 'execute', '--verbose=2', appPath]);
    run('xcrun', ['stapler', 'validate', appPath]);
    console.log('Signed and notarized app verification passed.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
