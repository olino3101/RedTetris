import { createRoot } from "react-dom/client";
import { useMemo, useCallback, startTransition } from "react";
import "./App.css";
import Game from "/src/components/Game";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useParams,
} from "react-router-dom";
import { useUserData } from "./hooks/UseUserData";

createRoot(document.getElementById("root")).render(<App />);

function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route
                        path="/:room/:name"
                        element={<GameIfConnected />}
                    />
                    <Route path="*" element={<div>NOT FOUND</div>} />
                </Routes>
            </Router>
        </div>
    );
}

const GameIfConnected = () => {
    const { room, name } = useParams();

    // Memoize params to prevent unnecessary hook calls
    const memoizedParams = useMemo(() => ({ room, name }), [room, name]);

    const { socket, isConnected, error } = useUserData(memoizedParams);

    // Memoize the Game component to prevent unnecessary re-renders
    const MemoizedGame = useMemo(() => {
        if (isConnected && !error && socket) {
            return <Game room={room} name={name} socket={socket} />;
        }
        return null;
    }, [room, name, socket, isConnected, error]);

    // Use startTransition for non-urgent updates
    const renderContent = useCallback(() => {
        if (isConnected && !error) {
            return MemoizedGame;
        } else {
            return <div>Waiting server Connection...</div>;
        }
    }, [isConnected, error, MemoizedGame]);

    return renderContent();
};

export default App;