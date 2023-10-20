/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { database } from '../utils.js';
const { ipcRenderer } = require('electron');

class Participation {
    static id = "participation";
    async init() {
        this.database = await new database().init();
        this.initBtn();
    }

    initBtn() {
        document.querySelector("#participation").addEventListener("click", () => {
            ipcRenderer.send("main-window-close");
        })
    }
}

export default Participation;