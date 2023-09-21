/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { database } from '../utils.js';
const { ipcRenderer } = require('electron');

class Maintenance {
    static id = "maintenance";
    async init() {
        this.database = await new database().init();
        this.initBtn();
    }

    initBtn() {
        document.querySelector("#maintenance").addEventListener("click", () => {
            ipcRenderer.send("main-window-close");
        })
    }
}

export default Maintenance;