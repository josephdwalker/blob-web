import { FC } from "react"
import { CumulativeScores } from "./Models/CumulativeScores"
import "./css/gameStyles.css";

export interface ScoreProps {
    players: string[],
    scores: CumulativeScores[]
}

export const ScoresTable: FC<ScoreProps> = ({players, scores}) => {
    return (
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
                    {players.length >= 6 && (
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
                        {players.length >= 6 && (
                            <td key={`playerSix-${j}`}>
                                {score.playerFourScore}
                            </td>
                        )}
                        {players.length >= 6 && (
                            <td key={`playerSixCumulative-${j}`}>
                                {score.playerFourCumulativeScore}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>)
}