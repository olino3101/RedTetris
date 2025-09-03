import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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
                        element={
                            <>
                                <GameIfConnected />
                            </>
                        }
                    />
                    <Route path="*" element={<div>NOT FOUND</div>} />
                </Routes>
            </Router>
        </div>
    );
}

const GameIfConnected = () => {
    const { room, name } = useParams();
    // send to other
    const { socket, isConnected, error } = useUserData({ room, name });
    if (isConnected && !error) {
        return <Game room={room} name={name} socket={socket}></Game>;
    } else {
        return <div>Waiting server Connection...</div>;
    }
};

export default App;
