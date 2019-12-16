// Copyright (c) [2019] Ian He
// jsonrpc-wsc is licensed under the Mulan PSL v1.
// You can use this software according to the terms and conditions of the Mulan PSL v1.
// You may obtain a copy of Mulan PSL v1 at:
// http://license.coscl.org.cn/MulanPSL
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v1 for more details.

import {Request} from './types';

let id = 0;
export default class JsonRpcClient {
    static async with<T>(url: string , callback: (client: JsonRpcClient) => Promise<T>): Promise<T> {
        const client = new JsonRpcClient(url);
        await client.isReady;
        const ret = await callback(client);
        client.destroy();
        return ret;
    }

    //@ts-ignore
    isReady: Promise<JsonRpcClient>;
    //@ts-ignore
    protected _ws: WebSocket;
    protected isDestroyed: boolean = false;

    protected handlers: { [id: string]: any };

    constructor(protected address: string) {
        this.handlers = {};
        this.connect();
    }

    connect (): void {
        try {
            this._ws = new WebSocket(this.address);

            this.isReady = new Promise(resolve => {
                this._ws.addEventListener('open', () => resolve(this));
            });

            this._ws.onclose = this.onSocketClose;
            this._ws.onmessage = this.onSocketMessage;
        } catch (error) {
            console.error(error);
        }
    }

    async send<T>(method: string, params?: any): Promise<T>{
        await this.isReady;
        const req: Request = {jsonrpc: '2.0', id: id++, method, params};
        this._ws.send(JSON.stringify(req));
        return new Promise<T>((resolve, reject) => {
            this.handlers[req.id] = [resolve, reject];
        });
    }

    destroy(): void {
        this.isDestroyed = true;
        this._ws.close();
    }

    private onSocketClose = (event: CloseEvent): void => {
        if (this.isDestroyed) return;

        console.error(`disconnected from ${this.address} code: '${event.code}' reason: '${event.reason}'`);
        setTimeout((): void => {
            this.connect();
        }, 1000);
    };

    private onSocketMessage = ({data: dataStr}: {data: string}) => {
        try {
            const data = JSON.parse(String(dataStr));
            if (data.id !== undefined && data.id !== null && this.handlers[data.id]) {
                const [resolve, reject] = this.handlers[data.id];
                delete this.handlers[data.id];
                if (data.hasOwnProperty('error')) {
                    reject(data.error);
                } else {
                    resolve(data.result);
                }
            }
        } catch (e) {
            // TODO
            console.error(e);
        }
    }

}
