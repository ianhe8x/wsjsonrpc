// Copyright (c) [2019] Ian He
// jsonrpc-wsc is licensed under the Mulan PSL v1.
// You can use this software according to the terms and conditions of the Mulan PSL v1.
// You may obtain a copy of Mulan PSL v1 at:
// http://license.coscl.org.cn/MulanPSL
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v1 for more details.

export interface Message<T> {
    jsonrpc: '2.0';
    method: string;
    params?: T;
}

export interface Request<T = any> extends Message<T> {
    id: string | number;
}

export interface Notification<T = any> extends Message<T> {
}

export interface ResponseSuccess<T extends ResponseSuccessType> {
    id: string | number | null;
    result: T;
}

export type ResponseSuccessType = string | number | boolean | object | null;

export interface ResponseError {
    id: string | number | null;
    error: {
        code: number;
        message: string;
        data?: any;
    };
}

export type Response<T extends ResponseSuccessType> = ResponseSuccess<T> | ResponseError;
