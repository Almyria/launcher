/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { logger, database, changePanel } from '../utils.js';

const { Launch, Status } = require('minecraft-java-core');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');
const launch = new Launch();
const pkg = require('../package.json');

const dataDirectory = process.env.APPDATA || (process.platform == 'darwin' ? `${process.env.HOME}/Library/Application Support` : process.env.HOME)

class Home {
    static id = "home";
    async init(config, news) {
        this.config = config
        this.news = await news
        this.database = await new database().init();
        this.initNews();
        this.initLaunch();
        this.initBtn();
    }

    async initNews() {
        let news = document.querySelector('.news-list');
        if (this.news) {
            if (!this.news.length) {
                let blockNews = document.createElement('div');
                blockNews.classList.add('news-block', 'opacity-1');
                blockNews.innerHTML = `
                    <div class="news-header">
                        <div class="header-text">
                            <div class="title">Aucun news n'est actuellement disponible.</div>
                        </div>
                    </div>
                    <div class="news-content">
                        <div class="bbWrapper">
                            <p>Vous pourrez suivre ici toutes les nouvelles relatives au serveur.</p>
                        </div>
                    </div>`
                news.appendChild(blockNews);
            } else {
                for (let News of this.news) {
                    let date = await this.getdate(News.publish_date)
                    let blockNews = document.createElement('div');
                    blockNews.classList.add('news-block');
                    blockNews.innerHTML = `
                        <div class="news-header">
                            <div class="header-text">
                                <div class="title">${News.title}</div>
                            </div>
                            <div class="date">
                                <div class="day">${date.day}</div>
                                <div class="month">${date.month}</div>
                            </div>
                        </div>
                        <div class="news-content">
                            <div class="bbWrapper">
                                <p>${News.content.replace(/\n/g, '</br>')}</p>
                                <p class="news-author">Auteur,<span> ${News.author}</span></p>
                            </div>
                        </div>`
                    news.appendChild(blockNews);
                }
            }
        } else {
            let blockNews = document.createElement('div');
            blockNews.classList.add('news-block', 'opacity-1');
            blockNews.innerHTML = `
                <div class="news-header">
                    <div class="header-text">
                        <div class="title">Erreur :</div>
                    </div>
                </div>
                <div class="news-content">
                    <div class="bbWrapper">
                        <p>Impossible de contacter le serveur des nouvelles.</br>Merci de vérifier votre configuration.</p>
                    </div>
                </div>`
            // news.appendChild(blockNews);
        }
    }

    async initLaunch() {
 
    const self = this;

    async function launchGame() {
        let modal = document.getElementById('alert-modal');
        modal.style.display = "none";
        let uuid = (await self.database.get('1234', 'accounts-selected')).value;
        let account = (await self.database.get(uuid.selected, 'accounts')).value;
        let ram = (await self.database.get('1234', 'ram')).value;
        let Resolution = (await self.database.get('1234', 'screen')).value;
        let launcherSettings = (await self.database.get('1234', 'launcher')).value;
    
        let playBtn = document.querySelector('.play-btn');
        let info = document.querySelector(".text-download")
        let progressBar = document.querySelector(".progress-bar")
    
        if (Resolution.screen.width == '<auto>') {
            screen = false
        } else {
            screen = {
                width: Resolution.screen.width,
                height: Resolution.screen.height
            }
        }
    
        // Télécharger le fichier JSON
        fetch(`${pkg.cdn_url}/files_to_delete.json`)
        .then(response => response.json())
        .then(filesToDelete => {
            const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', '.almyriacraft-s7');
    
            for (const file of filesToDelete) {
                const filePath = path.join(appDataPath, file);
    
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Le fichier ${file} a été supprimé.`);
                } else {
                    console.log(`Le fichier ${file} n'existe pas.`);
                }
            }
        })
        .catch(error => console.error(`Erreur lors du téléchargement du fichier JSON : ${error}`));
    
        let opts = {
            url: `${pkg.cdn_url}/files.json`,
            authenticator: account,
            timeout: 10000,
            path: `${dataDirectory}/${process.platform == 'darwin' ? self.config.dataDirectory : `.${self.config.dataDirectory}`}`,
            version: self.config.game_version,
            detached: launcherSettings.launcher.close === 'close-all' ? false : true,
            downloadFileMultiple: 30,
    
            loader: {
                type: self.config.loader.type,
                build: self.config.loader.build,
                enable: self.config.loader.enable,
            },
    
            verify: self.config.verify,
            ignored: ['loader', ...self.config.ignored],
    
            java: true,
    
            memory: {
                min: `${ram.ramMin * 1024}M`,
                max: `${ram.ramMax * 1024}M`
            }
        }
    
        playBtn.style.display = "none"
        info.style.display = "block"
        launch.Launch(opts);
    
        launch.on('extract', extract => {
            console.log(extract);
        });
    
        launch.on('progress', (progress, size) => {
            progressBar.style.display = "block"
            document.querySelector(".text-download").innerHTML = `Téléchargement ${((progress / size) * 100).toFixed(0)}%`
            ipcRenderer.send('main-window-progress', { progress, size })
            progressBar.value = progress;
            progressBar.max = size;
        });
    
        launch.on('check', (progress, size) => {
            progressBar.style.display = "block"
            document.querySelector(".text-download").innerHTML = `Vérification ${((progress / size) * 100).toFixed(0)}%`
            progressBar.value = progress;
            progressBar.max = size;
        });
    
        launch.on('estimated', (time) => {
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor((time - hours * 3600) / 60);
            let seconds = Math.floor(time - hours * 3600 - minutes * 60);
            console.log(`${hours}h ${minutes}m ${seconds}s`);
        })
    
        launch.on('speed', (speed) => {
            console.log(`${(speed / 1067008).toFixed(2)} Mb/s`)
        })
    
        launch.on('patch', patch => {
            console.log(patch);
            info.innerHTML = `Patch en cours...`
        });
    
        launch.on('data', (e) => {
            new logger('Minecraft', '#36b030');
            if (launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-hide");
            ipcRenderer.send('main-window-progress-reset')
            progressBar.style.display = "none"
            info.innerHTML = `Démarrage en cours...`
            console.log(e);
        })
    
        launch.on('close', code => {
            if (launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-show");
            progressBar.style.display = "none"
            info.style.display = "none"
            playBtn.style.display = "block"
            info.innerHTML = `Vérification`
            new logger('Launcher', '#7289da');
            console.log('Close');
        });
    
        launch.on('error', err => {
            console.log(err);
        });
    }

    let playButton = document.querySelector('.play-btn');
        let modal = document.getElementById('alert-modal');

        playButton.addEventListener('click', async () => {
            let ramInfo = (await this.database.get('1234', 'ram'))?.value;
            let noWarning;
            try {
                noWarning = (await this.database.get('1234', 'no-warning'))?.value;
            } catch (error) {
                // Si une erreur se produit, définir noWarning à false par défaut
                noWarning = false;
            }

            if (ramInfo.ramMax < 7 && !noWarning) {
                modal.style.display = "block";
                        
                let self = this;

                document.querySelector('#launch-game-anyway').addEventListener('click', async () => {
                    let noWarningCheckbox = document.querySelector('#no-warning');
                    if (noWarningCheckbox.checked) {
                        // L'utilisateur ne veut plus voir l'avertissement
                        await self.database.put('1234', 'no-warning', {value: true});
                    }
                    launchGame();
                });
                document.querySelector('#modify-game').addEventListener('click', function() {
                    // Change l'onglet actif en Java
                    document.querySelector('.settings-btn').click();
                });
            } else {
                launchGame();
            }
        });

        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });

    }

    initBtn() {
        document.querySelector('.settings-btn').addEventListener('click', () => {
            changePanel('settings');
        });
    }

    async getdate(e) {
        let date = new Date(e)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let allMonth = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        return { year: year, month: allMonth[month - 1], day: day }
    }
}
export default Home;