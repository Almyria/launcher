/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

const pkg = require('../package.json');
const fetch = require("node-fetch");
const axios = require('axios');
let url = pkg.user ? `${pkg.url}/${pkg.user}` : pkg.url
let api = pkg.api_url;
let cdn = pkg.cdn_url;

let config = `${cdn}/config.json`;
let news = `${url}/launcher/news-launcher/GetNews.php`;
let launcherstatus = `${api}/launcher/status`;
let staffmembers = `${api}/config/staffmembers`;

class Config {
    GetConfig() {
        return new Promise((resolve, reject) => {
            fetch(config).then(config => {
                return resolve(config.json());
            }).catch(error => {
                return reject(error);
            })
        })
    }

    async GetNews() {
        let rss = await fetch(news);
        if (rss.status === 200) {
            try {
                let news = await rss.json();
                return news;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }

    async GetLauncherStatus() {
        let status = await axios.get(launcherstatus);
        return status.data.status;
    }

    async GetStaffUsernames() {
        let staff = await axios.get(staffmembers);
        // Return only the usernames
        return staff.data.staff.map(staff => staff.uuid_mc);
    }
}

export default new Config;