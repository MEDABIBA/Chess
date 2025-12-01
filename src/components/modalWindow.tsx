const Modal = ({
  winColor,
  reloadGame,
  setIsActive,
}: {
  winColor: "White" | "Black";
  reloadGame: () => void;
  setIsActive: (value: boolean) => void;
}) => (
  <div className="modal" role="dialog">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{winColor} won!</h5>
          <button
            type="button"
            className="close"
            onClick={() => setIsActive(false)}
            data-dismiss="modal"
            aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        {/* <div className="modal-body">
          <p>Modal body text goes here.</p>
        </div> */}
        <div className="modal-footer">
          <button type="button" onClick={() => reloadGame()} className="btn btn-primary">
            Reset
          </button>
          <button
            type="button"
            onClick={() => setIsActive(false)}
            className="btn btn-secondary"
            data-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
export default Modal;
