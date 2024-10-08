import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { CumulativeScores } from "./Models/CumulativeScores";
import { ScoresTable } from "./ScoresTable";
import { Chat } from "./Chat";
import { Bidding } from "./Bidding";
import "./css/gameStyles.css";
import { useSignalRConnection } from "./useSignalRConnection";
import { useLocation } from "react-router-dom";
import { url } from "./Helper";

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
    const [playedCards, setPlayedCards] = useState<string[][]>([]);
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
            previousCard: string
        ) => {
            setNextPlayerToPlay(nextPlayer);
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
                {nextPlayerToPlay >= 0 && (
                    <h2>
                        {players[nextPlayerToPlay]} turn to play a card
                    </h2>
                )}
                {nextPlayerToBid >= 0 && !readyForNextRound && (
                    <h2>{players[nextPlayerToBid]} turn to bid</h2>
                )}
                <div className="bidding">
                    <Bidding bid={bid} setBid={setBid} gameID={gameID} playerPosition={playerPosition} nextPlayerToBid={nextPlayerToBid} maxBid={cards.length} readyForNextRound={readyForNextRound}/>
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
