// =====================================================================================
// ================================   electron_main.js   ===============================
// =====================================================================================

// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	
		// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron

const fs             = require('fs');
const path           = require('path');

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, _END_ 
	  }              = require('../util/color/color_console_codes.js');
	  
const { REQUEST_LOG_2_MAIN, VIEW_TOGGLE_DEVTOOLS,
		FromMain_DID_FINISH_LOAD, FromMain_SET_RENDERER_VALUE 		
	  }              = require('../_renderer/const_events.js');
  
const MAIN_WINDOW_WIDTH  = 800;
const MAIN_WINDOW_HEIGHT = 600; 

let g_DidFinishLoad_FiredCount = 0;
		
const getRootPath = () => {
	return path.resolve(__dirname, '..');
} // getRootPath()

const gotTheLock       = app.requestSingleInstanceLock();
let   gShow_DebugPanel = false;

const error_handler = (err) => { 
	if (err) return console.log("error: " + err);
	console.log('saving file... '+ filename); 
}; // error_handler()

const ELECTRON_MAIN_MENU_TEMPLATE = [
	{ 	label: "File",
		submenu: [ {  label: "Quit", 
					  click() { app.quit(); }
			       }
				 ]
	},
	{ 	label: "View",
		submenu: [ {  label: "ToggleDebug", type: 'checkbox',
				      click() {
					      console.log('>> ' + _CYAN_ + '[Electron] ' + _YELLOW_ + VIEW_TOGGLE_DEVTOOLS + _END_);	
						  ElectronMain.ToggleDebugPanel();  
				      }		 
			       }
		         ]
	}
]; // menu_template

class ElectronMain {
	static MainWindow = null;
	
	//==================== ElectronWindow.CreateWindow() ====================
	// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
	static CreateWindow() {
		console.log(">> " + _CYAN_ + "ElectronMain.CreateWindow" + _END_);

		// to Hide 'Security Warning'
		process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
		
		//console.log(__dirname);
		let main_window = new BrowserWindow({
			width:  MAIN_WINDOW_WIDTH, height: MAIN_WINDOW_HEIGHT,
			//icon:   path.join(__dirname, "../../icons/ZCash_rev_icn.png"),
			webPreferences: {
					contextIsolation: true, // NB: 'true' is default value but keep it there anyway
					preload:          path.join(__dirname, "./preload.js")
				}
		});
		ElectronMain.MainWindow = main_window;
			
		const menu_bar = Menu.buildFromTemplate(ELECTRON_MAIN_MENU_TEMPLATE);
		Menu.setApplicationMenu(menu_bar);	
		
		//ipcMain_toggleDebugPanel();
		
		// https://www.electronjs.org/docs/latest/api/web-contents#instance-events
		// https://stackoverflow.com/questions/42284627/electron-how-to-know-when-renderer-window-is-ready
		// Note: index.html loaded twice (first index.html redirect)
		// ==================== 'did-finish-load' event handler ====================
		ElectronMain.MainWindow.webContents.on('did-finish-load', 
			() => {
				//console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load --" + _END_);
				
				// Note: must load twice (I suspect because of first 'index.html' redirect)
				g_DidFinishLoad_FiredCount++;
				
				if (g_DidFinishLoad_FiredCount == 2) {
					console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load " + _END_ + "FiredCount==2");	
					
					//---------- Set 'Cryptocalc_version' in Renderer GUI ----------
					let Cryptocalc_version = process.env.npm_package_version;
					//console.log("   Cryptocalc: " + Cryptocalc_version);				
					ElectronMain.MainWindow.setTitle('Cryptocalc ' + Cryptocalc_version); 
					//---------- Set 'Cryptocalc_version' in Renderer GUI
					
					ElectronMain.MainWindow.webContents.send("fromMain", [ FromMain_DID_FINISH_LOAD ]);
					
					//console.log("   Send : " + FromMain_SET_RENDERER_VALUE + " = " + Cryptocalc_version);
					ElectronMain.MainWindow.webContents.send("fromMain", [ FromMain_SET_RENDERER_VALUE, Cryptocalc_version ]);
					
					// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
					// Open urls in the user's browser
					// nB: Triggeted by 'Renderer_GUI.OnExploreWallet()'
					ElectronMain.MainWindow.webContents.setWindowOpenHandler((edata) => {
						shell.openExternal(edata.url);
						return { action: "deny" };
					});
					
					ElectronMain.SetCallbacks();
				}
			} // 'did-finish-load' callback
		); // ==================== 'did-finish-load' event handler
		
		ElectronMain.MainWindow.loadFile('./index.html');
	} // ElectronMain.CreateWindow()

	static SetCallbacks() {
		console.log(">> " + _CYAN_ + "ElectronMain.SetCallbacks" + _END_);

		// ====================== REQUEST_LOG_2_MAIN ======================
		// called like this by Renderer: window.ipcMain.log2Main(data)
		ipcMain.on(REQUEST_LOG_2_MAIN, (event, data) => {
			console.log(data);
		}); // "request:log2main" event handler
	} // ElectronMain.SetCallbacks()
	
	static ToggleDebugPanel() {
		console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + "ToggleDebugPanel" + _END_);
		gShow_DebugPanel = ! gShow_DebugPanel;
		
		if (gShow_DebugPanel) {
			ElectronMain.MainWindow.webContents.openDevTools();
		}
		else {
			ElectronMain.MainWindow.webContents.closeDevTools();
		}
		//ElectronWindow.GetWindow().webContents.send
		//	("fromMain", [ "View/ToggleDebugPanel", gShow_DebugPanel ]);
	} // ElectronMain.ToggleDebugPanel()
} // ElectronMain class

// ========== Prevent Multiple instances of Electron main process ==========
// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron
if (! gotTheLock) {
	app.quit();
} 
else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
	// Someone tried to run a second instance, we should focus our window.
	if (ElectronMain.MainWindow != null) {
			if (ElectronMain.MainWindow) {
				ElectronMain.MainWindow.restore(); 
			}
			ElectronMain.MainWindow.focus();
		}
	}) // Manage case of second instance

	// Create Electron main window, load the rest of the app, etc...
	app.whenReady().then(() => {
		ElectronMain.CreateWindow();
	})
}
// ========== Prevent Multiple instances of Electron main process
