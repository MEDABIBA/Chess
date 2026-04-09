import { useState } from 'react';

export const Toastify = ({
  message,
  resolve,
}: {
  message: string;
  resolve?: (res: boolean) => void;
}) => {
  const [clicked, setClicked] = useState(false);
  return (
    <div>
      <p>{message}</p>
      {resolve && (
        <>
          <button
            className="popup-text"
            disabled={clicked}
            onClick={() => {
              resolve(true);
              setClicked(true);
            }}
          >
            Accept
          </button>
          <button
            className="popup-text"
            disabled={clicked}
            onClick={() => {
              resolve(false);
              setClicked(true);
            }}
          >
            Decline
          </button>
        </>
      )}
    </div>
  );
};
