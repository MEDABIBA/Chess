import { useEffect, useState } from 'react';
import { useStore } from '../provider/context';
import checkValidValue from '../helpers/checkValidNickname';

const AuthForm = () => {
  const { handleAuthSubmit } = useStore();
  const [auth, setAuth] = useState<'login' | 'registration'>('registration');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isError) {
      if (checkValidValue(username) && checkValidValue(password)) {
        setIsError(false);
      } else {
        setIsError(true);
      }
    }
  }, [isError, username, password]);

  return (
    <div className="backgound-image">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (checkValidValue(username) && checkValidValue(password)) {
            setIsError(false);
            await handleAuthSubmit(auth, username, password);
          } else {
            setIsError(true);
          }
        }}
        className="modal-window"
      >
        <div className="auth-title">
          <h2 className="auth-title-text">
            {auth === 'login' ? 'Login' : 'Registration'}
          </h2>
        </div>
        <label className="auth-elem">
          <h4>Username</h4>
          <input
            onChange={(el) => setUsername(el.target.value)}
            className="input"
            placeholder="Username"
            type="text"
            value={username}
          />
        </label>
        <label className="auth-elem">
          <h4>Password</h4>
          <input
            onChange={(el) => setPassword(el.target.value)}
            className="input"
            placeholder="Password"
            type="password"
            value={password}
          />
        </label>
        <button disabled={isError} className="submit-button">
          {' '}
          {auth === 'login' ? 'Login' : 'Create account'}
        </button>
        {isError && (
          <div className="input-error">
            Maximum 30 characters (Latin letters only)
          </div>
        )}
        <p>
          {auth === 'login'
            ? 'Dont have account? '
            : 'Already have username and password? '}
          <button
            className="auth-button"
            type="button"
            onClick={() =>
              auth === 'login' ? setAuth('registration') : setAuth('login')
            }
          >
            {auth === 'login' ? 'Registration' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
