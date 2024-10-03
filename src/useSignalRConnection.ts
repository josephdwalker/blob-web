import { useState, useEffect } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { url } from "./Helper";

export const useSignalRConnection: (
    hubName: string,
    username: string,
    gameID?: string
) => HubConnection | undefined = (hubName, username, gameID) => {
    const [connection, setConnection] = useState<HubConnection>();

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${url}${hubName}`)
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
