import { FC, useCallback } from "react";
import { url } from "./Game";
import "./css/gameStyles.css";

export interface BiddingProps {
    gameID?: number;
    bid: number,
    setBid: React.Dispatch<React.SetStateAction<number>>,
    playerPosition?: number;
    nextPlayerToBid: number;
    maxBid: number;
    readyForNextRound: boolean;
}

export const Bidding: FC<BiddingProps> = ({ gameID, bid, setBid, playerPosition, nextPlayerToBid, maxBid, readyForNextRound }) => {
    const increment = useCallback(() => {
        if (bid < maxBid) {
            setBid(bid + 1);
        }
    }, [bid, maxBid, setBid]);

    const decrement = useCallback(() => {
        if (bid > 0) {
            setBid(bid - 1);
        }
    }, [bid, setBid]);

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

    return (
        <div>
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
    )
}