import { HubConnection } from "@microsoft/signalr";
import { FC, useCallback, useEffect, useState } from "react";
import "./css/gameStyles.css";

export interface ChatProps {
    gameID?: number,
    username: string,
    connection: HubConnection | undefined;
};

export const Chat: FC<ChatProps> = ({ gameID, username, connection }) => {
    const [textValue, setTextValue] = useState<string>("");
    const [messages, setMessages] = useState<string[]>([]);

    const onReceiveMessage = useCallback(
        (message: string) => {
            setMessages([...messages, message]);
        },
        [messages]
    );

    const onSendClick = useCallback(async () => {
        if (connection && textValue !== "") {
            await connection.send(
                "SendGameChatMessage",
                gameID,
                username,
                textValue
            );
        }
        setTextValue("");
    }, [connection, gameID, textValue, username]);

    useEffect(() => {
        if (connection) {
            connection.on("GameChatMessage", onReceiveMessage);
        }
    }, [connection, onReceiveMessage])
    
    return (
        <div>
            <div>
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
    )
}