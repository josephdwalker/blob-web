import { FC, useCallback } from "react";
import "./css/gameStyles.css";
import { url } from "./Helper";

export interface BiddingProps {
    gameID?: string;
    bid: number,
    setBid: React.Dispatch<React.SetStateAction<number>>,
    playerPosition: number;
    bids: number[];
    maxBid: number;
    readyForNextRound: boolean;
}

export const Bidding: FC<BiddingProps> = ({ gameID, bid, setBid, playerPosition, bids, maxBid, readyForNextRound }) => {
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
        var response = await fetch(
            `${url}/api/Bids/${gameID}/gameID/${playerPosition}/player/${bid}/bid/setBid`
        ).then((response) => {
            if (response.status === 400) {
                return response.text();
            }
        });
        if (response) {
            alert(response);
        }
    }, [bid, gameID, playerPosition]);

    return (
        <div>
            <div>
                <button
                    id="increment"
                    onClick={increment}
                    disabled={
                        bids[playerPosition] != null ||
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
                        bids[playerPosition] != null ||
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
                        bids[playerPosition] != null ||
                        readyForNextRound
                    }
                >
                    submit bid
                </button>
            </div>
        </div>
    )
}