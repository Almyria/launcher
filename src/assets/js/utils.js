/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

import config from './utils/config.js';
import database from './utils/database.js';
import logger from './utils/logger.js';
import slider from './utils/slider.js';

const axios = require('axios');

export {
    config as config,
    database as database,
    logger as logger,
    changePanel as changePanel,
    addAccount as addAccount,
    slider as Slider,
    accountSelect as accountSelect
}

function changePanel(id) {
    let panel = document.querySelector(`.${id}`);
    let active = document.querySelector(`.active`)
    if (active) active.classList.toggle("active");
    panel.classList.add("active");
}

function addAccount(data) {
    let div = document.createElement("div");
    div.classList.add("account");
    div.id = data.uuid;
    div.innerHTML = `
        <img class="account-image" src="https://skins.almyria.fr/face/${data.uuid}?scale=100">
        <div class="account-name">${data.name}</div>
        <div class="account-uuid">${data.uuid}</div>
        <div class="account-delete"><div class="icon-account-delete icon-account-delete-btn"></div></div>
    `
    document.querySelector('.accounts').appendChild(div);
}

function accountSelect(uuid) {
    let account = document.getElementById(uuid);
    let pseudo = account.querySelector('.account-name').innerText;
    let activeAccount = document.querySelector('.active-account')

    if (activeAccount) activeAccount.classList.toggle('active-account');
    account.classList.add('active-account');
    headplayer(pseudo, uuid);
}

async function isVIP(uuid) {
    try {
        const { data: response } = await axios.get(`https://api.almyria.fr/minecraft/checkvip/` + uuid); 
        return response;
    } catch (error) {
        console.log(error);
    }
}

async function isBugHunter(uuid) {
    try {
        const { data: response } = await axios.get(`https://api.almyria.fr/minecraft/checkbughunter/` + uuid); 
        return response;
    } catch (error) {
        console.log(error);
    }
}

async function headplayer(pseudo, uuid) {
    document.querySelector(".player-head").style.backgroundImage = `url(https://skins.almyria.fr/face/${uuid}?scale=100)`;
    document.querySelector(".player-username").textContent = pseudo;

    const checkVIP = await isVIP(uuid);
 
    if (checkVIP == true) {
        var styleVIP = `
        .account-name::before {
            font-weight: bold;
            color: gold;
            content: "[VIP] ";
        }
        .player-head {
            border: 3px solid gold;
        }
        `;
        var sheetVIP = document.createElement('style');
        sheetVIP.innerText = styleVIP;
        document.head.appendChild(sheetVIP);
    } else {
        document.querySelector(".player-head").style.border = "2px solid #ffffff";
    }
}