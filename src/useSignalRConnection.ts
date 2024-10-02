import { useState, useEffect } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

export const useSignalRConnection: (
    hubName: string,
    username: string,
    gameID?: string
) => HubConnection | undefined = (hubName, username, gameID) => {
    const [connection, setConnection] = useState<HubConnection>();
    const Url = "https://localhost:44384";

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${Url}${hubName}`)
            .withAutomaticReconnect()
            .build();

        newConnection
            .start()
            .then(() => {
                newConnection.invoke("Register", username, gameID);
            })
            .catch((e: any) => console.log("Connection failed: ", e));

        setConnection(newConnection);
    }, [gameID, hubName, username]);

    return connection;
};
