import { Client } from 'discord-rpc';
import 'dotenv/config';
import express from 'express';

import { getToken, TokenFile } from './client.js';
import * as local_client from './client.js';

const clientId: string = process.env.CLIENT_ID ?? "";
const clientSecret: string = process.env.CLIENT_SECRET ?? "";
const port: number = Number(process.env.PORT) ?? 0;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(tokenContent: local_client.TokenContent): Promise<void> {

    const app = express();
    const server = app.listen(port);
    console.log();
    console.log(`ON/OFF: http://localhost:${port}/`);
    console.log();

    await new Promise<void>(async (resolve, reject) => {
        try {

            const rpc = new Client({ transport: 'ipc' });
            await rpc.login({
                clientId: clientId,
                clientSecret: clientSecret,
                accessToken: tokenContent.access_token,
                scopes: tokenContent.scope.split(' ')
            });

            console.log('Discord RPC 準備完了');
            console.log(`User: ${rpc.user?.username ?? 'Unknown User'}`);
            console.info('Discord RPC ログイン成功');

            app.get('/', async (req, res) => {
                const voiceSettings = await rpc.getVoiceSettings();
                res.send(voiceSettings.mute ? "unmuted" : "muted");
                rpc.setVoiceSettings({
                    mute: !voiceSettings.mute,
                    automaticGainControl: voiceSettings.automaticGainControl,
                    echoCancellation: voiceSettings.echoCancellation,
                    noiseSuppression: voiceSettings.noiseSuppression,
                    qos: voiceSettings.qos,
                    silenceWarning: voiceSettings.silenceWarning,
                    deaf: voiceSettings.deaf,
                });
            });

            rpc.on('disconnected', () => {
                resolve();
                server.close();
            });
        } catch (error) {
            reject(error);
            server.close();
        }
    });
}

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

    while (true) {
        try {
            await main(tokenContent);
        } catch (error) {
            console.error(error);
        } finally {
            await sleep(10000);
        }
    }
})();