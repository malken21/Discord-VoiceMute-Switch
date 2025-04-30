
import express from 'express';
import axios from 'axios';
import querystring from 'querystring';
import * as fs from 'fs/promises';
import open from 'open';

export interface TokenContent {
    access_token: string;
    refresh_token: string;
    scope: string;
    expires_in: string;
    create_date: number | null;
}

export async function getToken(client_id: string, client_secret: string): Promise<TokenContent>;
export async function getToken(client_id: string, client_secret: string, refresh_token: string): Promise<TokenContent>;

export async function getToken(client_id: string, client_secret: string, refresh_token?: string): Promise<TokenContent> {
    let data: Object;
    if (!refresh_token) {
        const app = express();
        const port = 5768;

        const redirect_url = `http://localhost:${port}/`;

        const url = `https://discord.com/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_url}&scope=rpc+rpc.voice.read+rpc.voice.write`
        open(url);

        var server = app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });

        data = await new Promise((resolve, reject) => {
            app.get('/', async (req, res) => {
                resolve(
                    querystring.stringify({
                        client_id: client_id,
                        client_secret: client_secret,
                        grant_type: 'authorization_code',
                        code: req.query.code as string,
                        redirect_uri: redirect_url,
                    })
                );
                res.send('OK');
            });
        });

        server.close();
    } else {

        data = querystring.stringify({
            client_id: client_id,
            client_secret: client_secret,
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        });

    }

    const response = (await axios.post('https://discordapp.com/api/oauth2/token', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })).data;
    response.create_date = Date.now();
    return response;
}


export class TokenFile {
    path: string;
    constructor(path: string) {
        this.path = path;
    }

    async load(): Promise<TokenContent> {
        const content = await fs.readFile(this.path, 'utf-8');
        return JSON.parse(content);
    }
    async save(content: TokenContent): Promise<void> {
        const jsonData = JSON.stringify(content, null, 2);
        await fs.writeFile(this.path, jsonData, 'utf-8');
    }
}