/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';
const { ipcRenderer } = require('electron');
import { config } from './utils.js';

let dev = process.env.NODE_ENV === 'dev';


class Splash {
    constructor() {
        this.splash = document.querySelector(".splash");
        this.splashMessage = document.querySelector(".splash-message");
        this.splashAuthor = document.querySelector(".splash-author");
        this.message = document.querySelector(".message");
        this.progress = document.querySelector("progress");
        document.addEventListener('DOMContentLoaded', () => this.startAnimation());
    }

    async startAnimation() {
        let splashes = [
            { "message": "un bonjour à Evan", "author": "eveleiden" },
            { "message": "ah les bâtards ils ont fumé pop simoké", "author": "eveleiden" },
            { "message": "Vous avez les cramptés?", "author": "boulbamed" },
            { "message": "Doumeining Town > BingChilling City", "author": "eveleiden"},
            { "message": "test", "author": "zerto." },
            { "message": "Début de l'attaque aux hamsters sauvages sur votre domicile", "author": "eveleiden" },
            { "message": "Merci aux donateurs pour votre soutien !", "author": "warpy" },
            { "message": "Merci aux VIPs pour votre soutien !", "author": "warpy" },
            { "message": "c'est reparti comme en 46", "author": "stormkun" },
            { "message": "koduro", "author": "koduro" },
            { "message": "KKC > all", "author": ".neville_" },
            { "message": "Ecipe de choce > Les mieux", "author": "warpy" },
            { "message": "À quand AlmyriaVision ?", "author": "warpy" },
            { "message": "Salut à tous c'est Fanta", "author": "TheFantasio974" }
        ]
        let splash = splashes[Math.floor(Math.random() * splashes.length)];
        this.splashMessage.textContent = splash.message;
        this.splashAuthor.children[0].textContent = "@" + splash.author;
        await sleep(100);
        document.querySelector("#splash").style.display = "block";
        await sleep(500);
        this.splash.classList.add("opacity");
        await sleep(500);
        this.splash.classList.add("translate");
        this.splashMessage.classList.add("opacity");
        this.splashAuthor.classList.add("opacity");
        this.message.classList.add("opacity");
        await sleep(1000);
        this.checkUpdate();
    }

    async checkUpdate() {
        if (dev) return this.startLauncher();
        this.setStatus(`Recherche de mise à jour...`);

        ipcRenderer.invoke('update-app').then(
            console.log('Laancement de la MàJ')
        ).catch(err => {
            console.error(err);
            return this.shutdown(`Erreur lors de la recherche de mise à jour :<br>${err.message}`);
        });

        ipcRenderer.on('updateAvailable', () => {
            this.setStatus(`Mise à jour disponible !`);
            this.toggleProgress();
            ipcRenderer.send('start-update');
        })

        ipcRenderer.on('download-progress', (event, progress) => {
            this.setProgress(progress.transferred, progress.total);
        })

        ipcRenderer.on('update-not-available', () => {
            this.maintenanceCheck();
        })

        ipcRenderer.on('error', (event, err) => {
            console.error(err);
            return this.shutdown(`Erreur lors de la mise à jour :<br>${err.message}`);
        })
    }

    async maintenanceCheck() {
        config.GetConfig().then(res => {
            if (res.maintenance) return this.shutdown(res.maintenance_message);
            this.startLauncher();
        }).catch(e => {
            console.error(e);
            return this.shutdown("Aucune connexion internet détectée,<br>veuillez réessayer ultérieurement.");
        })
    }

    startLauncher() {
        this.setStatus(`Démarrage du launcher`);
        ipcRenderer.send('main-window-open');
        ipcRenderer.send('update-window-close');
    }

    shutdown(text) {
        this.setStatus(`${text}<br>Arrêt dans 5s`);
        let i = 4;
        setInterval(() => {
            this.setStatus(`${text}<br>Arrêt dans ${i--}s`);
            if (i < 0) ipcRenderer.send('update-window-close');
        }, 1000);
    }

    setStatus(text) {
        this.message.innerHTML = text;
    }

    toggleProgress() {
        if (this.progress.classList.toggle("show")) this.setProgress(0, 1);
    }

    setProgress(value, max) {
        this.progress.value = value;
        this.progress.max = max;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

document.addEventListener("keydown", (e) => {
    /* if (e.ctrlKey && e.shiftKey && e.keyCode == 73 || e.keyCode == 123) {
        ipcRenderer.send("update-window-dev-tools");
    } */
})
new Splash();