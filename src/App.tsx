import { FC, useCallback, useEffect, useState } from "react";
import { Lobby } from "./Lobby";
import { useNavigate } from "react-router-dom";

export const App: FC = () => {
    const [pageState, setPageState] = useState("login");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const onSubmitClick = useCallback(() => {
        if (username !== "") {
            navigate(`lobby`);
            setPageState("lobby");
        }
    }, [navigate, username]);

    useEffect(() => {
        navigate(``);
    }, []);

    return pageState === "login" ? (
        <div className="login">
            <div>Username:</div>
            <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") onSubmitClick();
                }}
            />
            <button onClick={onSubmitClick}>Enter</button>
        </div>
    ) : (
        <Lobby username={username} />
    );
};
