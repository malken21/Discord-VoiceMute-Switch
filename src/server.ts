import express from 'express';

export const app = express();

export async function open(port: number) {
    return await app.listen(port);
}