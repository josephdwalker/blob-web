import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useSignalRConnection } from "./useSignalRConnection";
import { useLocation, useNavigate } from "react-router-dom";
import { AvailableGames } from "./Models/AvailableGames";

function generateString() {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i=0; i<12; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export const Lobby: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = useMemo(() => location.state.username, [location.state.username]);
    
    const [textValue, setTextValue] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [games, setGames] = useState<AvailableGames[]>([]);
    const connection = useSignalRConnection("/LobbyHub", username);

    const onCreateGame = async () => {
        var gameID = generateString();
        await connection?.send("CreateGame", gameID, username);
        navigate(`/${gameID}`, {state: {username, gameID}});
    };

    const onJoinGame = async (gameID: string) => {
        await connection?.send("JoinGame", gameID);
        navigate(`/${gameID}`, {state: {username, gameID}});
    };

    const onUpdateOpponents = useCallback((games: AvailableGames[]) => {
        setGames(games);
    }, []);

    const onSendClick = async () => {
        if (textValue !== "") {
            await connection?.send("SendChatMessage", username, textValue);
            setTextValue("");
        }
    };

    const onReceiveMessage = useCallback(
        (message: string) => {
            setMessages([...messages, message]);
        },
        [messages]
    );

    useEffect(() => {
        if (connection) {
            connection.on("AvailableGames", onUpdateOpponents);
            connection.on("LobbyChatMessage", onReceiveMessage);
        }
    }, [connection, username, onReceiveMessage, onUpdateOpponents]);

    return (
        <div className="lobby">
            <div className="gameArea">
                <button onClick={onCreateGame}>Create Game</button>
                <h2>Available games</h2>
                {games.map((game, j) => (
                    <button
                        key={j}
                        onClick={() => onJoinGame(game.gameID)}
                    >
                        {game.opponentUsername}
                    </button>
                ))}
            </div>
            <div className="chat">
                <div className="messageBox">
                    <input
                        type="text"
                        value={textValue}
                        onChange={(event) => {
                            setTextValue(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") onSendClick();
                        }}
                    />
                    <button onClick={onSendClick}>Send</button>
                </div>
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={index}>{message}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
