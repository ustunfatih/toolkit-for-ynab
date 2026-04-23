import * as React from 'react';
import { APP_CONFIG } from 'toolkit/core/common/app-config';

export const SupportLink = ({ children }: { children: React.ReactNode }) => (
  <a target="_blank" rel="noreferrer noopener" href={APP_CONFIG.supportUrl}>
    {children}
  </a>
);

export const GitHubLink = ({ children }: { children: React.ReactNode }) => (
  <a target="_blank" rel="noreferrer noopener" href={APP_CONFIG.homepageUrl}>
    {children}
  </a>
);

export const PrivacyPolicyLink = ({ children }: { children: React.ReactNode }) => (
  <a target="_blank" rel="noreferrer noopener" href={APP_CONFIG.privacyUrl}>
    {children}
  </a>
);

export const ReleaseNotesLink = ({ children }: { children: React.ReactNode }) => (
  <a target="_blank" rel="noreferrer noopener" href={APP_CONFIG.releasesUrl}>
    {children}
  </a>
);
