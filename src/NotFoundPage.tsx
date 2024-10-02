import { FC, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const NotFoundPage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const gameID = params?.gameID;
    const username = useMemo(() => location.state.username, [location.state.username]);

    const onSubmitClick = useCallback(() => {
        navigate("/", {state: {username}})
    }, [navigate, username]);

    return (
        <div className="notFoundPage">
            <div>Game not found with ID: {gameID}</div>
            <button onClick={onSubmitClick}>Return to Lobby</button>
        </div>
    )
};
