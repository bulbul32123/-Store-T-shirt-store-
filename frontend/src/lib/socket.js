'use client';
import { io } from 'socket.io-client';
import { SOCKET_URL } from "../utils/config";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
          withCredentials: true,
          autoConnect: false,
        });
    }
    return socket;
};