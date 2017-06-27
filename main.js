const path = require('path');
const electron = require('electron');

const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;

let menu;
let template;
let mainWindow = null;

// define which "webapplication" to load in the browser window
const APP_MAIN_PATH = `file://${__dirname}/app_todo/index.html`;
// const APP_MAIN_PATH = `file://${__dirname}/app_apidemo/index.html`;

// this would be only enabled in development mode
require('electron-debug')({enabled: true});
const p = path.join(__dirname, '..', 'app', 'node_modules');
require('module').globalPaths.push(p);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  await installExtensions();

  setupMainWindow();
  registerRendererEvents();
  registerGlobalShortcuts();
  setupMenu();

});

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
});

/**
 *
 */
const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer');

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];

    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

    return Promise
      .all(extensions.map(name => installer.default(installer[name], forceDownload)))
      .catch(console.log);
  }
};

/**
 * This will create a new Window that runs a Chromium Web View
 */
function setupMainWindow() {

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768
  });

  mainWindow.loadURL(APP_MAIN_PATH);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const {x, y} = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }
}

/**
 * registers for ipc Events that are sent by the electron renderer thread
 */
function registerRendererEvents() {

  ipcMain.on('demoMessage', (event, payload) => {
    console.log(`Message from renderer Process: ${payload}`);
  });

}

/**
 *
 */
function registerGlobalShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    console.log('CommandOrControl+Shift+Z is pressed')
  });
}

/**
 * setup the application menu (platform dependent)
 */
function setupMenu() {
  if (process.platform === 'darwin') {
    // Mac OS
    template = [{
      label: 'Cockpit',
      submenu: [{
        label: 'Hide Cockpit',
        accelerator: 'Command+H',
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }]
    }, {
      label: 'View',
      submenu: [{
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }]
    }];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

  } else {
    // windows + unix

    template = [{
      label: '&View',
      submenu: [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
}
