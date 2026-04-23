import { faBug, faCog, faStop, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Button } from 'toolkit/components/button';
import { APP_CONFIG } from 'toolkit/core/common/app-config';
import { PrivacyPolicyLink, SupportLink } from 'toolkit/components/links';
import { localToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser, getBrowserName } from 'toolkit/core/common/web-extensions';
import { useDarkModeSetter } from 'toolkit/hooks/useDarkModeSetter';
import { useToolkitDisabled } from 'toolkit/hooks/useToolkitDisabled';
import './styles.scss';

export function ToolkitPopup() {
  useDarkModeSetter();

  const isToolkitDisabled = useToolkitDisabled();
  const { runtime, tabs } = getBrowser();
  const { version, name } = runtime.getManifest();

  React.useEffect(() => {
    document.title = `${name} Control Center`;
  }, []);

  return (
    <div className="popup">
      <div className="hero">
        <span className="hero__eyebrow">{APP_CONFIG.subtitle}</span>
        <img
          className="logo"
          alt={name}
          src={runtime.getURL(
            `assets/images/logos/toolkitforynab-logo-200${isToolkitDisabled ? '-disabled' : ''}.png`,
          )}
        ></img>
        <div className="hero__title">{name}</div>
        <div className="hero__status">
          <span className={`status-pill ${isToolkitDisabled ? 'status-pill--off' : ''}`}>
            {isToolkitDisabled ? 'Disabled in Safari' : 'Ready in Safari'}
          </span>
        </div>
      </div>
      <div className="status-card">
        <div className="status-card__title">This Mac’s Safari setup</div>
        <div className="status-card__body">
          {isToolkitDisabled
            ? 'Open Safari settings to re-enable the extension if it was turned off after an update.'
            : 'Your settings stay on this Mac and apply whenever you open the YNAB web app in Safari.'}
        </div>
      </div>
      <div className="actions">
        <Button
          onClick={() =>
            localToolkitStorage.setFeatureSetting('DisableToolkit', !isToolkitDisabled)
          }
        >
          <FontAwesomeIcon icon={isToolkitDisabled ? faPlay : faStop} />{' '}
          <div>{isToolkitDisabled ? 'Enable' : 'Disable'}</div>
        </Button>
        <Button
          onClick={() => {
            if (getBrowserName() === 'edge') {
              tabs.create({
                url: runtime.getURL('options/index.html'),
              });
            } else {
              runtime.openOptionsPage();
            }
          }}
        >
          <FontAwesomeIcon icon={faCog} /> <div>Open Settings</div>
        </Button>
        <SupportLink>
          <Button>
            <FontAwesomeIcon icon={faBug} /> <div>Report an Issue</div>
          </Button>
        </SupportLink>
      </div>
      <div className="footer-links">
        <PrivacyPolicyLink>Privacy</PrivacyPolicyLink>
        <span>Version {version}</span>
      </div>
    </div>
  );
}
