const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const http = require('http');

const isDev = !app.isPackaged;
const PORT = 3000;

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#F5F4EF',
    icon: path.join(__dirname, '../public/icons/icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
  });

  // Neo-Brutalism window styling
  win.once('ready-to-show', () => {
    win.show();
    win.maximize();
  });

  // In dev, load localhost:3000, in prod load next build
  const startUrl = isDev ? `http://localhost:${PORT}` : `http://localhost:${PORT}`;

  // Wait for server if dev
  if (isDev) {
    let attempts = 0;
    while (attempts < 30) {
      const isUp = await checkServer();
      if (isUp) break;
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
  }

  await win.loadURL(startUrl);

  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Menu - Brutal style
  const template = [
    {
      label: 'Social Pulse',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit', label: 'Шығу' }
      ]
    },
    {
      label: 'Навигация',
      submenu: [
        { label: 'Overview', click: () => win.loadURL(`${startUrl}/overview`) },
        { label: 'Search', click: () => win.loadURL(`${startUrl}/search`) },
        { label: 'Analytics', click: () => win.loadURL(`${startUrl}/analytics`) },
        { label: 'Trends', click: () => win.loadURL(`${startUrl}/trends`) },
        { label: 'Competitors', click: () => win.loadURL(`${startUrl}/competitors`) },
      ]
    },
    {
      label: 'Көмек',
      submenu: [
        { label: 'DEMO DATA туралы', click: () => shell.openExternal('https://github.com/NUREKE178/neiro-marketing') },
        { label: 'DevTools', role: 'toggleDevTools' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
