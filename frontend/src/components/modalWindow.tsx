const Modal = ({
  title,
  setIsActive,
  action,
  text,
  secondAction,
}: {
  title: string;
  setIsActive: (value: boolean) => void;
  action: () => void;
  text?: string;
  secondAction?: () => void;
}) => (
  <div className="modal" role="dialog">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button
            type="button"
            className="close"
            onClick={() => setIsActive(false)}
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-footer">
          {text && (
            <button
              onClick={() => {
                action();
                setIsActive(false);
              }}
              type="button"
              className="btn btn-primary"
            >
              {text}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              secondAction?.();
              setIsActive(false);
            }}
            className="btn btn-secondary"
            data-dismiss="modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
export default Modal;
