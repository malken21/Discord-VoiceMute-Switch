import { Client } from 'discord-rpc';
import 'dotenv/config';

import { getToken, TokenFile } from './client.js';
import * as local_client from './client.js';
import * as local_server from './server.js';

const clientId: string = process.env.CLIENT_ID ?? "";
const clientSecret: string = process.env.CLIENT_SECRET ?? "";
const port: number = Number(process.env.PORT) ?? 0;

const rpc = new Client({ transport: 'ipc' });

rpc.on('ready', async () => {
    console.log('Discord RPC 準備完了');
    console.log(`User: ${rpc.user?.username ?? 'Unknown User'}`);
});

(async () => {
    const tokenFile: TokenFile = new TokenFile("./token.json");
    let tokenContent: local_client.TokenContent;
    try {
        tokenContent = await tokenFile.load();
        // token を作成してから 1時間以上経過している場合は、再取得する
        tokenContent = await getToken(clientId, clientSecret, tokenContent.refresh_token);
    } catch (error) {
        tokenContent = await getToken(clientId, clientSecret);
    }

    await tokenFile.save(tokenContent);

    await rpc.login({
        clientId: clientId,
        clientSecret: clientSecret,
        accessToken: tokenContent.access_token,
        scopes: tokenContent.scope.split(' ')
    });
    console.info('Discord RPC ログイン成功');

    const server = await local_server.open(port);

    console.log();
    console.log(`ON/OFF: http://localhost:${port}/`);
    console.log(`Close: http://localhost:${port}/close`);
    console.log();

    local_server.app.get('/', async (req, res) => {
        const voiceSettings = await rpc.getVoiceSettings();
        res.send(voiceSettings.mute ? "unmuted" : "muted");
        rpc.setVoiceSettings({
            mute: !voiceSettings.mute,
            automaticGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
            qos: false,
            silenceWarning: false,
            deaf: false
        });
    });

    local_server.app.get('/close', async (req, res) => {
        await res.send('close');
        await server.close();
        rpc.destroy();
    });
})();