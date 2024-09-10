import { HubConnection } from "@microsoft/signalr";
import { FC, useCallback, useEffect, useState } from "react";
import { CumulativeScores } from "./CumulativeScores";
import "./css/gameStyles.css";

const url = "https://localhost:44384/api";

export interface GameInterface {
    username: string;
    connection: HubConnection | undefined;
}

export const Game: FC<GameInterface> = ({ username, connection }) => {
    const [gameID, setGameId] = useState<number>();
    const [cards, setCards] = useState<string[]>([]);
    const [playerPosition, setPlayerPosition] = useState<number>();
    const [players, setPlayers] = useState<string[]>([]);
    const [bid, setBid] = useState<number>(0);
    const [bids, setBids] = useState<number[]>([]);
    const [nextPlayerToBid, setNextPlayerToBid] = useState<number>(-1);
    const [leadingCard, setLeadingCard] = useState<boolean>(false);
    const [playedCards, setPlayedCards] = useState<string[][]>([]);
    const [nextPlayerToPlay, setNextPlayerToPlay] = useState<number>(-1);
    const [canStartGame, setCanStartGame] = useState<boolean>(true);
    const [readyForNextRound, setReadyForNextRound] = useState<boolean>(false);
    const [scores, setScores] = useState<CumulativeScores[]>([]);
    const [textValue, setTextValue] = useState<string>("");
    const [messages, setMessages] = useState<string[]>([]);

    const onReceiveGameDetails = useCallback(
        (gameId: number, players: string[]) => {
            setGameId(gameId);
            setPlayers(players);
            setPlayerPosition(players.indexOf(username));
        },
        [username]
    );

    const startGame = useCallback(() => {
        if (gameID) {
            fetch(`${url}/Score/startGame`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    GameID: gameID,
                    NumberOfPlayers: players.length,
                    NumberOfRounds: 13,
                    NoTrumpsRound: true,
                    ScoreOnMakingBidOnly: false,
                    BotsPositions: 0,
                }),
            });
        }
    }, [gameID, players.length]);

    const fetchCards = useCallback(() => {
        if (gameID && playerPosition !== undefined) {
            fetch(
                `${url}/Deck/${gameID}/gameID/${playerPosition}/player/getHand`
            )
                .then((response) => response.json())
                .then((data) => setCards(data));
        }
    }, [gameID, playerPosition]);

    const playCard = useCallback(
        async (card: string) => {
            if (nextPlayerToPlay === playerPosition) {
                var response = await fetch(
                    `${url}/Deck/${gameID}/gameID/${playerPosition}/player/${leadingCard}/leadingCard/${card}/card/playCard`
                ).then((response) => {
                    if (response.status === 200) {
                        var newCards = cards.filter((c) => c !== card);
                        setCards(newCards);
                    }
                    if (response.status === 400) {
                        return response.text();
                    }
                });
                if (response) {
                    alert(response);
                }
            } else {
                if (nextPlayerToPlay === -1) {
                    alert("Bidding is not finished");
                } else {
                    alert("Not your turn to play a card");
                }
            }
        },
        [cards, gameID, leadingCard, nextPlayerToPlay, playerPosition]
    );

    const fetchBids = useCallback(() => {
        if (gameID) {
            fetch(`${url}/Bids/${gameID}/gameID/getBids`)
                .then((response) => response.json())
                .then((data) => setBids(data));
        }
    }, [gameID]);

    const submitBid = useCallback(async () => {
        if (nextPlayerToBid === playerPosition) {
            var response = await fetch(
                `${url}/Bids/${gameID}/gameID/${playerPosition}/player/${bid}/bid/setBid`
            ).then((response) => {
                if (response.status === 400) {
                    return response.text();
                }
            });
            if (response) {
                alert(response);
            }
        }
    }, [bid, gameID, nextPlayerToBid, playerPosition]);

    const fetchScores = useCallback(() => {
        if (gameID) {
            fetch(`${url}/Score/${gameID}/gameID/getScores`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.length !== 0) {
                        setScores(data);
                    }
                });
        }
    }, [gameID]);

    const onBidUpdate = useCallback(
        (nextPlayer: number, previousBid: number, previousPlayer: number) => {
            setNextPlayerToBid(nextPlayer);
            if (previousBid !== undefined && previousPlayer !== undefined) {
                var newBids = bids;
                newBids[previousPlayer] = previousBid;
                setBids(newBids);
            } else {
                setReadyForNextRound(true);
                setCanStartGame(false);
                fetchCards();
                fetchScores();
            }
        },
        [bids, fetchCards, fetchScores]
    );

    const onCardUpdate = useCallback(
        (
            nextPlayer: number,
            leadingCard: boolean,
            previousPlayer: number,
            previousCard: string
        ) => {
            setNextPlayerToPlay(nextPlayer);
            setLeadingCard(leadingCard);
            var cards = playedCards;
            cards[previousPlayer].push(previousCard);
            setPlayedCards(cards);
            if (nextPlayer === -1) {
                fetchScores();
            }
        },
        [fetchScores, playedCards]
    );

    const startNextRound = useCallback(() => {
        setReadyForNextRound(false);
        var empty = [];
        for (var i = 0; i < players.length; i++) {
            empty.push([]);
        }
        setPlayedCards(empty);
        setBid(0);
        setBids([]);
        fetchBids();
    }, [fetchBids, players.length]);

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
            connection.on("GameDetails", onReceiveGameDetails);
            connection.on("BidUpdate", onBidUpdate);
            connection.on("CardsUpdate", onCardUpdate);
            connection.on("GameChatMessage", onReceiveMessage);
        }
    }, [
        connection,
        onReceiveGameDetails,
        onBidUpdate,
        onReceiveMessage,
        onCardUpdate,
    ]);

    const increment = useCallback(() => {
        if (bid < cards?.length) {
            setBid(bid + 1);
        }
    }, [bid, cards?.length]);

    const decrement = useCallback(() => {
        if (bid > 0) {
            setBid(bid - 1);
        }
    }, [bid]);

    return (
        <div>
            <div className="arena">
                {canStartGame && (
                    <button disabled={players.length < 2} onClick={startGame}>
                        Start Game
                    </button>
                )}
                <div className="players">
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Bids</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playedCards.map((player, i) => (
                                    <tr key={`player-${i}-cards`}>
                                        <td>{players[i]}</td>
                                        <td>{bids[i]}</td>
                                        {player.map((card, j) => (
                                            <td key={`player-card-${j}`}>
                                                {card}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {!readyForNextRound && (
                    <div className="hand">
                        {nextPlayerToPlay >= 0 && (
                            <h2>
                                {players[nextPlayerToPlay]} turn to play a card
                            </h2>
                        )}
                        <div>
                            {cards.map((card, j) => (
                                <img
                                    className="card"
                                    key={j.toString()}
                                    onClick={() => playCard(card)}
                                    src={require(`./Cards/${card}.png`)}
                                    alt="buttonpng"
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div className="bid">
                    {nextPlayerToBid >= 0 && !readyForNextRound && (
                        <h2>{players[nextPlayerToBid]} turn to bid</h2>
                    )}
                    <div>
                        <button
                            id="increment"
                            onClick={increment}
                            disabled={
                                nextPlayerToBid !== playerPosition ||
                                readyForNextRound
                            }
                        >
                            Increment
                        </button>
                        <input type="number" value={bid} readOnly={true} />
                        <button
                            id="decrement"
                            onClick={decrement}
                            disabled={
                                nextPlayerToBid !== playerPosition ||
                                readyForNextRound
                            }
                        >
                            Decrement
                        </button>
                    </div>
                    <div className="submitBid">
                        <button
                            onClick={submitBid}
                            disabled={
                                nextPlayerToBid !== playerPosition ||
                                readyForNextRound
                            }
                        >
                            submit bid
                        </button>
                    </div>
                </div>
                <div className="nextRound">
                    {readyForNextRound && (
                        <button onClick={startNextRound}>
                            Start Next Round
                        </button>
                    )}
                </div>
                <div className="scores">
                    <table>
                        <thead>
                            <tr>
                                <th>Tricks</th>
                                <th>Trumps</th>
                                <th colSpan={2}>{players[0]}</th>
                                {players.length >= 2 && (
                                    <th colSpan={2}>{players[1]}</th>
                                )}
                                {players.length >= 3 && (
                                    <th colSpan={2}>{players[2]}</th>
                                )}
                                {players.length >= 4 && (
                                    <th colSpan={2}>{players[3]}</th>
                                )}
                                {players.length >= 5 && (
                                    <th colSpan={2}>{players[4]}</th>
                                )}
                                {players.length === 6 && (
                                    <th colSpan={2}>{players[5]}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, j) => (
                                <tr key={`row-${j}`}>
                                    <td key={`tricks-${j}`}>{score.tricks}</td>
                                    <td key={`trumps-${j}`}>
                                        {score.trumpSuit}
                                    </td>
                                    <td key={`playerOne-${j}`}>
                                        {score.playerOneScore}
                                    </td>
                                    <td key={`playerOneCumulative-${j}`}>
                                        {score.playerOneCumulativeScore}
                                    </td>
                                    <td key={`playerTwo-${j}`}>
                                        {score.playerTwoScore}
                                    </td>
                                    <td key={`playerTwoCumulative-${j}`}>
                                        {score.playerTwoCumulativeScore}
                                    </td>
                                    {players.length >= 3 && (
                                        <td key={`playerThree-${j}`}>
                                            {score.playerThreeScore}
                                        </td>
                                    )}
                                    {players.length >= 3 && (
                                        <td key={`playerThreeCumulative-${j}`}>
                                            {score.playerThreeCumulativeScore}
                                        </td>
                                    )}
                                    {players.length >= 4 && (
                                        <td key={`playerFour-${j}`}>
                                            {score.playerFourScore}
                                        </td>
                                    )}
                                    {players.length >= 4 && (
                                        <td key={`playerFourCumulative-${j}`}>
                                            {score.playerFourCumulativeScore}
                                        </td>
                                    )}
                                    {players.length >= 5 && (
                                        <td key={`playerFive-${j}`}>
                                            {score.playerFourScore}
                                        </td>
                                    )}
                                    {players.length >= 5 && (
                                        <td key={`playerFiveCumulative-${j}`}>
                                            {score.playerFourCumulativeScore}
                                        </td>
                                    )}
                                    {players.length === 6 && (
                                        <td key={`playerSix-${j}`}>
                                            {score.playerFourScore}
                                        </td>
                                    )}
                                    {players.length === 6 && (
                                        <td key={`playerSixCumulative-${j}`}>
                                            {score.playerFourCumulativeScore}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="chat">
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
        </div>
    );
};
