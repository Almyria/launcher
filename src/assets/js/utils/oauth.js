const path = require('path');
const { app, BrowserWindow, session } = require('electron');
const axios = require('axios');
const defaultProperties = {
  width: 1000,
  height: 650,
  resizable: false,
  center: true,
};

class oauth {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.authUrl = config.authUrl;
    this.tokenUrl = config.tokenUrl;
  }

  async getAccessToken(code) {
    try {
      const response = await axios.post(this.tokenUrl, {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to get access token');
    }
  }

  openAuthWindow() {
    const authWindow = new BrowserWindow({ width: 800, height: 600, show: false });
    
    authWindow.loadURL(this.authUrl);

    return new Promise((resolve, reject) => {
      authWindow.once('closed', () => {
        reject(new Error('Authentication window was closed.'));
      });

      authWindow.webContents.on('will-redirect', async (_, newUrl) => {
        const url = new URL(newUrl);
        if (url.searchParams.has('code')) {
          const code = url.searchParams.get('code');
          try {
            const tokenData = await this.getAccessToken(code);
            resolve(tokenData);
          } catch (error) {
            reject(error);
          } finally {
            authWindow.close();
          }
        }
      });

      authWindow.show();
    });
  }
}

export default oauth;