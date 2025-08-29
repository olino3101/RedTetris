import { useEffect, useState } from "react";

export const useUserData = ({ room, name }) => {
    const [serverUrl, setServerUrl] = useState('https://localhost:1234');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // connection should return a function to connect and disconnect
        // const connection = createConnection(serverUrl, room, name);
        // connection.connect();
        setInterval(() => {
            setIsConnected(true);
        }, 500);
        return () => {
            setIsConnected(false);
            // connection.disconnect();
        };
    }, [serverUrl, room, name]);
    return isConnected;
}