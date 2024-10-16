import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { CumulativeScores } from "./Models/CumulativeScores";
import { ScoresTable } from "./ScoresTable";
import { Chat } from "./Chat";
import { Bidding } from "./Bidding";
import "./css/gameStyles.css";
import { useSignalRConnection } from "./useSignalRConnection";
import { useLocation } from "react-router-dom";
import { url } from "./Helper";
import { ActiveHand } from "./Models/ActiveHand";

export const Game: FC = () => {
    const location = useLocation();
    const gameID = useMemo(() => location.state.gameID, [location.state.gameID]);
    const username = useMemo(() => location.state.username, [location.state.username]);
    
    const [cards, setCards] = useState<string[]>([]);
    const [playerPosition, setPlayerPosition] = useState<number>();
    const [players, setPlayers] = useState<string[]>([]);
    const [bid, setBid] = useState<number>(0);
    const [bids, setBids] = useState<number[]>([]);
    const [nextPlayerToBid, setNextPlayerToBid] = useState<number>(-1);
    const [activeHands, setActiveHands] = useState<ActiveHand[]>([]);
    const [nextPlayerToPlay, setNextPlayerToPlay] = useState<number>(-1);
    const [canStartGame, setCanStartGame] = useState<boolean>(true);
    const [readyForNextRound, setReadyForNextRound] = useState<boolean>(false);
    const [scores, setScores] = useState<CumulativeScores[]>([]);

    const connection = useSignalRConnection("/GameHub", username, gameID);

    const onReceiveGameDetails = useCallback(
        (players: string[]) => {
            setPlayers(players);
            setPlayerPosition(players.indexOf(username));
        },
        [username]
    );

    const startGame = useCallback(() => {
        if (gameID) {
            fetch(`${url}/api/Score/startGame`, {
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
                `${url}/api/Deck/${gameID}/gameID/${playerPosition}/player/getHand`
            )
                .then((response) => response.json())
                .then((data) => setCards(data));
        }
    }, [gameID, playerPosition]);

    const playCard = useCallback(
        async (card: string) => {
                var response = await fetch(
                    `${url}/api/Deck/${gameID}/gameID/${playerPosition}/player/${card}/card/playCard`
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
        },
        [cards, gameID, playerPosition]
    );

    const fetchBids = useCallback(() => {
        if (gameID) {
            fetch(`${url}/api/Bids/${gameID}/gameID/getBids`)
                .then((response) => response.json())
                .then((data) => setBids(data));
        }
    }, [gameID]);

    const fetchScores = useCallback(() => {
        if (gameID) {
            fetch(`${url}/api/Score/${gameID}/gameID/getScores`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.length !== 0) {
                        setScores(data);
                    }
                });
        }
    }, [gameID]);

    const fetchActiveHand = useCallback(() => {
        if (gameID) {
            fetch(`${url}/api/Deck/${gameID}/gameID/getActiveHands`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.length !== 0) {
                        setActiveHands(data);
                    }
                })
        }
    }, [gameID])

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
            previousPlayer: number,
            previousCard: string,
            leadingCard: boolean
        ) => {
            setNextPlayerToPlay(nextPlayer);
            if (previousCard) {
                var cards = activeHands;
                if (leadingCard) {
                    switch (previousPlayer) {
                        case 0:
                            cards.push({playerOneCard: previousCard});
                            break;
                        case 1:
                            cards.push({playerTwoCard: previousCard});
                            break;
                        case 2:
                            cards.push({playerThreeCard: previousCard});
                            break;
                        case 3:
                            cards.push({playerFourCard: previousCard});
                            break;
                        case 4:
                            cards.push({playerFiveCard: previousCard});
                            break;
                        case 5:
                            cards.push({playerSixCard: previousCard});
                            break;
                    }
                } else {
                    switch (previousPlayer) {
                        case 0:
                            cards[cards.length-1].playerOneCard = previousCard;
                            break;
                        case 1:
                            cards[cards.length-1].playerTwoCard = previousCard;
                            break;
                        case 2:
                            cards[cards.length-1].playerThreeCard = previousCard;
                            break;
                        case 3:
                            cards[cards.length-1].playerFourCard = previousCard;
                            break;
                        case 4:
                            cards[cards.length-1].playerFiveCard = previousCard;
                            break;
                        case 5:
                            cards[cards.length-1].playerSixCard = previousCard;
                            break;
                    }
                }
                setActiveHands(cards);
            }
        },
        [activeHands]
    );

    const startNextRound = useCallback(() => {
        setReadyForNextRound(false);
        setActiveHands([]);
        setBid(0);
        setBids([]);
        fetchBids();
    }, [fetchBids]);

    useEffect(() => {
        if (connection) {
            connection.on("GameDetails", onReceiveGameDetails);
            connection.on("BidUpdate", onBidUpdate);
            connection.on("CardsUpdate", onCardUpdate);
        }
    }, [
        connection,
        onReceiveGameDetails,
        onBidUpdate,
        onCardUpdate,
    ]);

    return (
        <div>
            <div className="arena">
                {canStartGame && (
                    <button disabled={players.length < 2} onClick={startGame}>
                        Start Game
                    </button>
                )}
                {!readyForNextRound && (
                    <div className="hand">
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
                                {players.map((player, i) => (
                                    <tr key={`player-${i}-cards`}>
                                        <td>{player}</td>
                                        <td>{bids[i]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {nextPlayerToPlay >= 0 && (
                    <h2>
                        {players[nextPlayerToPlay]} turn to play a card
                    </h2>
                )}
                {nextPlayerToBid >= 0 && !readyForNextRound && (
                    <h2>{players[nextPlayerToBid]} turn to bid</h2>
                )}
                <div className="bidding">
                    <Bidding bid={bid} setBid={setBid} gameID={gameID} playerPosition={playerPosition ?? 0} bids={bids} maxBid={cards.length} readyForNextRound={readyForNextRound}/>
                </div>
                <div className="played-cards">
                            {activeHands.map((round, i) => (
                                <div key={i}>
                                    {round.playerOneCard && (
                                        <img
                                            className="card"
                                            key={`playeroneplayed-${i}`}
                                            src={require(`./Cards/${round.playerOneCard}.png`)}
                                            alt=""
                                        />
                                    )}
                                    {round.playerTwoCard && (
                                        <img
                                            className="card"
                                            key={`playertwoplayed-${i}`}
                                            src={require(`./Cards/${round.playerTwoCard}.png`)}
                                            alt=""
                                        />
                                    )}
                                    {round.playerThreeCard && (
                                        <img
                                            className="card"
                                            key={`playerthreeplayed-${i}`}
                                            src={require(`./Cards/${round.playerThreeCard}.png`)}
                                            alt=""
                                        />
                                    )}
                                    {round.playerFourCard &&  (
                                        <img
                                            className="card"
                                            key={`playerfourplayed-${i}`}
                                            src={require(`./Cards/${round.playerFourCard}.png`)}
                                            alt=""
                                        />
                                    )}
                                    {round.playerFiveCard && (
                                        <img
                                            className="card"
                                            key={`playerfiveplayed-${i}`}
                                            src={require(`./Cards/${round.playerFiveCard}.png`)}
                                            alt=""
                                        />
                                    )}
                                    {round.playerSixCard && (
                                        <img
                                            className="card"
                                            key={`playersixplayed-${i}`}
                                            src={require(`./Cards/${round.playerSixCard}.png`)}
                                            alt=""
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                <div className="startNextRound">
                    {readyForNextRound && (
                        <button onClick={startNextRound}>
                            Start Next Round
                        </button>
                    )}
                </div>
                <div className="scores">
                    <ScoresTable players={players} scores={scores} />
                </div>
            </div>
            <div className="chat">
                <Chat gameID={gameID} username={username} connection={connection}/>
            </div>
        </div>
    );
};
