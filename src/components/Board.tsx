import { SquareData } from "../types/types"
import Square from "./Square"

const Board = () => {
    const board: SquareData[] = []
    for (let row = 8; row > 0; row--){
        for (let col = 1; col < 9; col++){
            const position = {
                row,
                col
            }
            board.push({ color: (row + col) %2 === 0 ? 'black' : 'white', position})
        }
    }
    return (
        <div className="board">
            {board.map(({ color, position }) => {
                return <Square key={`${position.row}-${position.col}`} color={color} position={position}/>
            })}
        </div>
    )
}

export default Board