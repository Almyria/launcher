/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

import { config } from '../utils.js'

const { ipcRenderer } = require('electron');

class Maintenance {
    static id = "maintenance";
    async init() {
        this.config = config;
        this.initMsg();
        this.initBtn();
    }

    async initMsg() {
        let maintenance_message = await config.GetConfig().then(res => res.maintenance_message).catch(err => err) || "Le launcher est en maintenance, veuillez réessayer plus tard.";
        if (maintenance_message) document.querySelector("#maintenance_message").innerHTML = maintenance_message;
    }

    initBtn() {
        document.querySelector("#maintenance").addEventListener("click", () => {
            ipcRenderer.send("main-window-close");
        })
    }
}

export default Maintenance;