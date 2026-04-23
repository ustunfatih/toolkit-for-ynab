import * as React from 'react';
import * as PropTypes from 'prop-types';
import './styles.scss';

export function ToolkitReleaseModal({ onClose }) {
  const { assets, links, name, version } = ynabToolKit;

  return (
    <div className="tk-release-modal">
      <div className="tk-release-modal__logo">
        <img src={assets.logo} />
      </div>
      <div className="tk-release-modal__content">
        <h1 className="tk-release-modal__header">{name} has been updated!</h1>
        <p className="tk-release-modal__message--centered">
          You are now using version{' '}
          <a href={links.releases} target="_blank" rel="noopener noreferrer">{version}</a>
          .
        </p>
        <p className="tk-release-modal__message">
          <strong>{name} is completely separate, and in no way affiliated with YNAB itself.</strong>{' '}
          If you discover a bug, please disable the Toolkit to identify whether the issue is with
          the extension or with YNAB itself and report the issue accordingly.
        </p>
        <p className="tk-release-modal__message">
          Issues with {name} can be reported on the support tracker linked from the app. Please
          ensure the issue has not already been reported before submitting.
        </p>
        <p className="tk-release-modal__message">
          Review the latest notes on the{' '}
          <a href={links.support} target="_blank" rel="noopener noreferrer">
            support page
          </a>{' '}
          or read the{' '}
          <a href={links.privacy} target="_blank" rel="noopener noreferrer">
            privacy policy
          </a>{' '}
          for the current Safari release.
        </p>
      </div>
      <div className="tk-release-modal__actions">
        <button className="button button-primary" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}

ToolkitReleaseModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
