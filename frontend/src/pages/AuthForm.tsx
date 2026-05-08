import { useState } from 'react';
import { useStore } from '../provider/context';
import checkValidValue from '../helpers/checkValidNickname';
import Header from '../components/Header';

const AuthForm = () => {
  const { handleAuthSubmit } = useStore();
  const [auth, setAuth] = useState<'login' | 'registration'>('registration');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="appearance-animation">
      <div className="backgound-image">
        <Header />
        <div className="container">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (checkValidValue(username) && checkValidValue(password)) {
                await handleAuthSubmit(auth, username, password);
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
              <h4 className="auth-elem-title">Username</h4>
              <input
                onChange={(el) => setUsername(el.target.value)}
                className="input"
                placeholder="Username"
                type="text"
                value={username}
              />
            </label>
            <label className="auth-elem">
              <h4 className="auth-elem-title">Password</h4>
              <input
                onChange={(el) => setPassword(el.target.value)}
                className="input"
                placeholder="Password"
                type="password"
                value={password}
              />
            </label>
            <button className="submit-button">
              {auth === 'login' ? 'Login' : 'Create account'}
            </button>
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
      </div>
    </div>
  );
};

export default AuthForm;
