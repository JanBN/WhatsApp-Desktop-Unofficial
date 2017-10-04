'use strict';
const electron = require('electron');
const path = require('path');
const appMenu = require('./menu');
const configStore = require('./config');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;
const Tray = electron.Tray;
const files = require('./files');
const ipc =  electron.ipcMain;

let mainWindow;
let appIcon;

function updateBadge(title) {
  const isOSX = Boolean(app.dock);

  const messageCount = (/\(([0-9]+)\)/).exec(title);

  if (isOSX) {
    app.dock.setBadge(messageCount ? messageCount[1] : '');
    if (messageCount)
    {
      app.dock.bounce('informational');
    }
  }

  if (messageCount) {
    appIcon.setImage(path.join(__dirname, 'media', 'tray-notification.png'));
  } else {
    appIcon.setImage(path.join(__dirname, 'media', 'tray.png'));
  }

}

function createMainWindow()
{
  const windowStateKeeper = require('electron-window-state');

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  const win = new BrowserWindow({
    title: app.getName(),
    show: false,
    icon: process.platform === 'linux' && path.join(__dirname, 'media', 'logo.png'),
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 400,
    minHeight: 200,
    autoHideMenuBar: true,    
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      plugins: true,
    }
  });

  // win.openDevTools();

  mainWindowState.manage(win);

  // win.loadURL('https://web.whatsapp.com', {
  //   userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
  // });


  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    // if (webContents.getURL() === host) {
      if (permission === 'notifications' && !configStore.get('ballonNotifications', true) ) {
        callback(false); // denied.
        return;
      // }
    }
  
    callback(true);
  });

  // console.log(win.webContents.session.setPermissionRequestHandler);
  // session.fromPartition(webview.partition).setPermissionRequestHandler()

  // win.webContents.session.setPermissionRequestHandler(
  //   function permissionRequestHandler(webContents, permission, callback) {

  //     console.log('a4');
  //    // Place a breakpoint here while debugging with the --inspect-brk command line switch
  //    return callback(false);
  //   }
  // );  

  // console.log('a2');

  win.loadURL('file://' + __dirname + '/index.html');

  const ses = win.webContents.session
  console.log(ses.getUserAgent())

  win.on('closed', () => app.quit);
  win.on('page-title-updated', (e, title) => updateBadge(title));
  win.on('close', e => {
    if (process.platform === 'darwin' && !win.forceClose) {
      e.preventDefault();
      win.hide();
    }
    else
    if (process.platform === 'win32' && configStore.get('closeToTray', true) )
    {
      win.hide();
      e.preventDefault();
    }
  });

  win.on('minimize', () => {
    if (process.platform === 'win32' && configStore.get('minimizeToTray', true)) {
      win.hide();
    }
  });



  return win;
}

function createTray() {
  appIcon = new Tray(path.join(__dirname, 'media', 'logo-tray.png'));
  appIcon.setPressedImage(path.join(__dirname, 'media', 'logo-tray-white.png'));
  appIcon.setContextMenu(appMenu.trayMenu);
   // appIcon.setToolTip('This is my application.');

  appIcon.on('double-click', () => {

    if (mainWindow.isVisible())
    {
      mainWindow.hide();
    }
    else
    {
      mainWindow.show();
    }
  });

  appIcon.on('click', () => {
    if (mainWindow.isVisible())
    {
      mainWindow.hide();
    }
    else
    {
      mainWindow.show();
    }
  });
}

app.on('ready', () => {
  electron.Menu.setApplicationMenu(appMenu.mainMenu);

  mainWindow = createMainWindow();
  createTray();

  const page = mainWindow.webContents;

  appMenu.webContents = page;

  page.on('dom-ready', () => {
    mainWindow.show();
  });

  page.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  page.on('did-finish-load', () => {
    mainWindow.setTitle(app.getName());
  });

  ipc.on('did-finish-load-from-renderer', function(event, arg)
  {
    if (configStore.get('theme') == 'clean')
    {
       files.getThemeCss('clean', css =>
       {
          mainWindow.webContents.send('set-theme', css);
      });
    }
    else
    {
    }
  });

  ipc.on('ctrl+w__pressed', function(event, arg)
  {
    mainWindow.hide();
  });
  
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  mainWindow.forceClose = true;
});

app.on('activate-with-no-open-windows', () => {
  mainWindow.show();
});
