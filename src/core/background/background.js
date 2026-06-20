import { getBrowser, getBrowserName, isSafariBrowser } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage } from 'toolkit/core/common/storage';
import { Browser } from 'toolkit/core/common/constants';

const ONE_HOUR_MS = 1000 * 60 * 60;
const TOOLKIT_DISABLED_FEATURE_SETTING = 'DisableToolkit';
export const NEXT_UPDATE_CHECK_STORAGE_KEY = 'next-update-check';

export class Background {
  _browser = getBrowser();

  _storage = new ToolkitStorage();

  constructor() {
    this._storage.getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING).then(this._updatePopupIcon);
  }

  initListeners() {
    if (this._browser.runtime?.onMessage?.addListener) {
      this._browser.runtime.onMessage.addListener(this._handleMessage);
    }

    if (!isSafariBrowser() && this._browser.runtime?.onUpdateAvailable?.addListener) {
      this._browser.runtime.onUpdateAvailable.addListener(this._handleUpdateAvailable);
    }

    this._storage.onToolkitDisabledChanged((_, isToolkitDisabled) =>
      this._updatePopupIcon(isToolkitDisabled),
    );
    this._checkForUpdates();
  }

  _handleUpdateAvailable = () => {
    this._browser.runtime.reload();
  };

  _checkForUpdates = async () => {
    if (getBrowserName() !== Browser.Chrome) {
      return;
    }

    const now = Date.now();
    const nextUpdateCheck = await this._storage.getStorageItem(NEXT_UPDATE_CHECK_STORAGE_KEY);

    if (!nextUpdateCheck || now >= nextUpdateCheck) {
      this._browser.runtime.requestUpdateCheck((status) => {
        let nextCheck = now + ONE_HOUR_MS;
        if (status === 'throttled') {
          nextCheck += ONE_HOUR_MS;
        }

        this._storage.setStorageItem(NEXT_UPDATE_CHECK_STORAGE_KEY, nextCheck);
      });
    }

    setTimeout(this._checkForUpdates, ONE_HOUR_MS);
  };

  _handleMessage = (message, _sender, sendResponse) => {
    switch (message.type) {
      case 'storage':
        this._handleStorageMessage(message.content, sendResponse);
        break;
      case 'error':
        this._handleException(message.context, sendResponse);
        break;
      default:
        console.log('unknown message', message);
    }
  };

  _handleException = (context) => {
    console.groupCollapsed(`[Toolkit for YNAB] ${context.featureName || 'unknown'} error`);
    console.error(context.serializedError);
    console.info('Feature setting:', context.featureSetting);
    console.info('Function:', context.functionName);
    console.info('Route:', context.routeName);
    console.groupEnd();
  };

  _handleStorageMessage = (request, callback) => {
    if (typeof localStorage === 'undefined') {
      callback(null);
      return;
    }

    switch (request.type) {
      case 'keys':
        callback(Object.keys(localStorage));
        break;
      case 'get':
        callback(localStorage.getItem(request.itemName));
        break;
      default:
        console.log('unknown storage request', request);
    }
  };

  _updatePopupIcon = (isToolkitDisabled) => {
    const imagePath = `assets/images/icons/button${isToolkitDisabled ? '-disabled' : ''}.png`;
    const imageURL = this._browser.runtime.getURL(imagePath);

    if (typeof this._browser.action === 'undefined') {
      this._browser.browserAction.setIcon({ path: imageURL });
    } else {
      this._browser.action.setIcon({ path: imageURL });
    }
  };
}
