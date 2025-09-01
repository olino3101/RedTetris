import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const useUserData = ({ room, name } = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!socketRef.current) {
            // Frontend calls /api/socket.io ; Caddy strips /api -> backend /socket.io
            socketRef.current = io({
                path: "/api/socket.io",
                withCredentials: true,
            });
        }
        const socket = socketRef.current;

        const handleConnect = () => {
            console.log("[socket] connected id:", socketRef.current.id);
            setIsConnected(true);
            setError(null);
            if (room && name) {
                console.log(
                    "trying to join room",
                    room,
                    "with player name",
                    name
                );
                socket.emit("joinRoom", { room, name });
            }
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleConnectError = (err) => {
            console.warn(
                "[socket] connect_error",
                err.message,
                err.description,
                err.context
            );
            setError(err.message || "connect_error");
            setIsConnected(false);
        };
        const handleError = (err) => {
            console.warn("[socket] error", err);
            setError(err?.message || "error");
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("error", handleError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("error", handleError);
            socket.disconnect();
            socketRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { socket: socketRef.current, isConnected, error };
};
