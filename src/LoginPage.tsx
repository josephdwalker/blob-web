import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage: FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    const onSubmitClick = useCallback(() => {
        if (username !== "") {
            navigate("/lobby", {state: {username}})
        }
    }, [navigate, username]);

    return (
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
    )
};
