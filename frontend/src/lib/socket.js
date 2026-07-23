// socket.js
'use client';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/config';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(API_URL, {
            withCredentials: true,
            autoConnect: false,
        });
    }
    return socket;
};