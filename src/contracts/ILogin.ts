/**
 * Contract defining standard authentication interactions across Web and Mobile platforms.
 */
export interface ILogin {
  /**
   * Navigate or open the login screen/page.
   */
  open(): Promise<void>;

  /**
   * Submit credentials to authenticate into the application.
   * @param username Account username (e.g. 'standard_user')
   * @param password Account password (e.g. 'secret_sauce')
   */
  login(username: string, password: string): Promise<void>;

  /**
   * Retrieve the displayed error banner text when login fails.
   */
  getErrorMessage(): Promise<string>;

  /**
   * Check whether authentication succeeded and the user is on the main catalog screen.
   */
  isLoggedIn(): Promise<boolean>;
}

