import appConfig from 'toolkit/app-config.json';

export const APP_CONFIG = appConfig;

export const getCurrentOrigin = () =>
  typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '*';
