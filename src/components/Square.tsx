import { SquareData } from "../types/types"

const Square = ({ color, position }: SquareData) => {
    const { row, col } = position
    
    return (
        <div className={`square ${color}`} data-row={row} data-col={col}></div>
    )
}
export default Square