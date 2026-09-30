// Preload script for Social Pulse Desktop
// Secure bridge between Electron and Web

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('socialPulse', {
  platform: 'windows',
  version: '1.0.0',
  isDemo: true,
  isElectron: true,
  getAppInfo: () => ({
    name: 'Social Pulse',
    tagline: 'Find Trends. Analyze Content. Make Smarter Moves.',
    version: '1.0.0',
    demo: 'DEMO DATA — нақты аккаунт статистикасы емес'
  })
});
