const {app, BrowserWindow, Menu, ipcMain, Tray} = require('electron');
const log = require('electron-log');
const {Store} = require("./Store");
const path = require("path");
// Set env
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let tray;

const store = new Store({
    configName: 'user-settings',
    default: {
        settings: {
            cpuOverload: 80,
            alertFrequency: 5
        }
    }
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'SysTop',
        width: isDev ? 800 : 355,
        height: 500,
        icon: './assets/icons/icon.png',
        resizable: isDev,
        show: false,
        opacity: 0.9,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile('./app/index.html');
}

app.on('ready', () => {
    createMainWindow();
    mainWindow.webContents.on('dom-ready', () => {
       mainWindow.webContents.send('settings:get', store.get('settings'))
    });
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    const icon = path.join(__dirname, "assets", "icons", "tray_icon.png");
    tray = new Tray(icon);
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    })
});

const menu = [
    ...(isMac ? [{role: 'appMenu'}] : []),
    {
        role: 'fileMenu',
    },
    ...(isDev
        ? [
            {
                label: 'Developer',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {type: 'separator'},
                    {role: 'toggledevtools'},
                ],
            },
        ]
        : []),
];

ipcMain.on('settings:set', (e, value) => {
    store.set('settings', value);
    mainWindow.webContents.send('settings:get', store.get('settings'));
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

app.allowRendererProcessReuse = true
