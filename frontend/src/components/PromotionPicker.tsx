import Piece from "../models/Piece";
import { useStore } from "../provider/context";
import { Color, Position, PropotionPieceType } from "../types/types";

type Promotion = {
  oldPiece: Piece;
  color: Color;
  position: Position;
};
const PromotionPiece = ({ oldPiece, piece }: { oldPiece: Piece; piece: Piece }) => {
  const { board } = useStore();
  return (
    <img
      className={`piece-img`}
      src={piece.getPiece()}
      alt="#"
      draggable={false}
      onPointerDown={(e) => {
        e.preventDefault();
        if (e.pointerType === "touch" || e.pointerType === "mouse") {
          board.promotePiece(oldPiece, piece);
        }
      }}
      style={{ cursor: "pointer", userSelect: "none" }}
    />
  );
};
const PromotionPicker = ({ oldPiece, color, position }: Promotion) => {
  const pos = { left: `${(position.col - 1) * 12.5}%`, top: `${position.row === 8 ? 0 : 49.7}%` };
  return (
    <div className="promotion-window" style={pos}>
      {PropotionPieceType.map((el, i) => {
        const piece = new Piece(el, position, color);
        return (
          <div className={"square propotion-square"} key={i}>
            <PromotionPiece oldPiece={oldPiece} piece={piece} />
          </div>
        );
      })}
    </div>
  );
};
export default PromotionPicker;
