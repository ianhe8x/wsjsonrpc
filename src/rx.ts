// Copyright (c) [2019] Ian He
// jsonrpc-wsc is licensed under the Mulan PSL v1.
// You can use this software according to the terms and conditions of the Mulan PSL v1.
// You may obtain a copy of Mulan PSL v1 at:
// http://license.coscl.org.cn/MulanPSL
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v1 for more details.

import {fromEvent, Observable, ReplaySubject, Subject} from "rxjs";
import {filter, map, switchMap, take} from "rxjs/operators";

import {Request, Response, ResponseError, ResponseSuccess, ResponseSuccessType} from './types';

let id = 0;
export default class JsonRpcRxClient {

    isReady$: Subject<boolean>;
    message$: Subject<Response<any> | Request>;

    //@ts-ignore
    protected _ws: WebSocket;
    protected isDestroyed: boolean = false;

    constructor(public address: string) {
        this.isReady$ = new ReplaySubject(1);
        this.message$ = new Subject();
        this.connect();
    }

    send<T extends ResponseSuccessType>(method: string, params?: any): Observable<T> {
        const req: Request = {jsonrpc: '2.0', id: id++, method, params};
        return this.isReady$.pipe(
            filter(r => r),
            take(1),
            switchMap(() => {
                this._ws.send(JSON.stringify(req));
                return this.message$.pipe(
                    filter(data => data.id === req.id),
                    map(data => {
                        if ((data as ResponseError).error) {
                            throw (data as ResponseError).error;
                        }
                        return (data as ResponseSuccess<T>).result;
                    }),
                    take(1)
                );
            })
        )
    }

    destroy(): void {
        this.isDestroyed = true;
        this._ws.close();
        this.isReady$.complete();
    }

    private connect(): void {
        try {
            this._ws = new WebSocket(this.address);

            this._ws.onclose = this.onSocketClose;
            this._ws.onopen = () => this.isReady$.next(true);
            fromEvent(this._ws, 'message').pipe(
                map(({data}: any) => JSON.parse(data))
            ).subscribe(message => this.message$.next(message));
        } catch (error) {
            console.error(error);
        }
    }

    private onSocketClose = (event: CloseEvent): void => {
        if (this.isDestroyed) return;

        console.error(`disconnected from ${this.address} code: '${event.code}' reason: '${event.reason}'`);
        this.isReady$.next(false);
        setTimeout((): void => {
            this.connect();
        }, 1000);
    }


}
