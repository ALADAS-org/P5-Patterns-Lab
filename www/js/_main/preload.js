// ========================================================================================
// ====================================   preload.js   ====================================
// ========================================================================================

// https://github.com/cdaein/p5js-electron-canvas-saver-boilerplate
const { contextBridge, ipcRenderer } = require('electron');

//console.log(">> ====== preload ======");

contextBridge.exposeInMainWorld(
	"ipcMain", {
		log2Main:                 (data) => ipcRenderer.send("request:log2main", data),
				
        receive: (channel, func) => {
            let validChannels = ['fromMain'];
			//console.log(">> preload: receive 1");
            if (validChannels.includes(channel)) {
				//console.log(">> preload: send 2");
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
	} 
); // contextBridge.exposeInMainWorld
