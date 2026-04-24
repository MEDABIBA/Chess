import notify from '../components/ui/notify';

class ApiService {
  async register(username: string, password: string) {
    try {
      const response = await fetch('http://localhost:3030/auth/registration', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const parsed = await response.json();
      if (!response.ok) {
        notify(parsed.message, 'error');
      }
      return parsed;
    } catch (err) {
      console.error(err);
    }
  }

  async login(username: string, password: string) {
    const response = await fetch('http://localhost:3030/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const parsed = await response.json();
    if (!response.ok) {
      throw new Error(parsed.message);
    }
    return parsed;
  }
  async refreshAccessToken() {
    const response = await fetch('http://localhost:3030/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const parsed = await response.json();
    if (!response.ok) {
      throw new Error(parsed.message);
    }
    return parsed.accessToken;
  }
}
export default new ApiService();
