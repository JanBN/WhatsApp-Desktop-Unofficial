'use strict';
const electron = require('electron');
const os = require('os');
const configStore = require('./config');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const shell = electron.shell;
const appName = app.getName();
 const ipc =  electron.ipcMain;
 const files = require('./files');

function restoreWindow() {
  const win = BrowserWindow.getAllWindows()[0];
  win.show();
  return win;
}

let webContents = null;

const trayTpl = [
  {
    label: 'Show',
    click() {
      restoreWindow();
    }
  },
  {
    type: 'separator'
  },
  {
    label: `Quit`,
    click() {
      app.exit(0);
    }
  }
];

const darwinTpl = [
  {
    label: appName,
    submenu: [
      {
        label: `About ${appName}`,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: `Hide ${appName}`,
        accelerator: 'Cmd+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Cmd+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: `Quit ${appName}`,
        accelerator: 'Cmd+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      },
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Cmd+F',
        click() {
          const win = BrowserWindow.getAllWindows()[0];
          win.setFullScreen(!win.isFullScreen());
        }
      }
    ]
  },
  {
    label: 'Help',
    role: 'help'
  }
];

const linuxTpl = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help'
  }
];

const winTpl = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      }
    ]
  },

  {
    label: 'Theme',
    submenu: [
      {
        label: 'Default',
        type: 'radio',
        checked: configStore.get('theme', '') == 'default',
        click(item)
        {
          configStore.set('theme', 'default');
          // module.exports.webContents.send('set-default-theme', 'ping');
          module.exports.webContents.send('reload');
        }
      },
      {
        label: 'Clean',
        type: 'radio',
        checked: configStore.get('theme', '') == 'clean',
        click(item) {
          configStore.set('theme', 'clean');

          module.exports.webContents.send('reload');
            // files.getThemeCss('clean', css =>
            // {
            // // module.exports.webContents.send('set-theme', css);
            // });

        }
      },
    ]
  },


  {
    label: 'Settings',
    submenu: [
      {
        label: 'Minimize to tray',
        type: 'checkbox',
        checked: configStore.get('minimizeToTray', true),
        click(item) {
          configStore.set('minimizeToTray', item.checked);
        }
      },
      {
        label: 'Close to tray',
        type: 'checkbox',
        checked: configStore.get('closeToTray', true),
        click(item) {
          configStore.set('closeToTray', item.checked);
        }
      },
      {
        label: 'Ballon Notifications',
        type: 'checkbox',
        checked: configStore.get('ballonNotifications', true),
        click(item) {
          configStore.set('ballonNotifications', item.checked);
          module.exports.webContents.send('reload');
        }
      },

    ]
  },
  {
    label: 'Help',
    role: 'help'
  }
];

const helpSubmenu = [
  {
    label: `${appName} Website...`,
    click() {
      shell.openExternal('https://github.com/mawie81/whatsdesktop');
    }
  },
  {
    label: 'Report an Issue...',
    click() {
      const body = `
**Please succinctly describe your issue and steps to reproduce it.**

-

${app.getName()} ${app.getVersion()}
${process.platform} ${process.arch} ${os.release()}`;

      shell.openExternal(`https://github.com/mawie81/whatsdesktop/issues/new?body=${encodeURIComponent(body)}`);
    }
  }
];

let tpl;
if (process.platform === 'darwin') {
  tpl = darwinTpl;
} else if (process.platform === 'win32') {
  tpl = winTpl;
} else {
  tpl = linuxTpl;
}

tpl[tpl.length - 1].submenu = helpSubmenu;

module.exports = {
  mainMenu: Menu.buildFromTemplate(tpl),
  trayMenu: Menu.buildFromTemplate(trayTpl),
  webContents: webContents
};
