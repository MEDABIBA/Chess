class TokenService {
  constructor() {}

  public getAccessToken() {
    return localStorage.getItem("accessToken");
  }
  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
  public setAccessToken(token: string) {
    localStorage.setItem("accessToken", token);
  }
}
export default new TokenService();
