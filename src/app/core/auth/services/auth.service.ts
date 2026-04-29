import { Injectable, computed, signal } from '@angular/core';
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  SignUpCommand,
  type AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider';
import { environment } from '../../../../environments/environment';

interface StoredTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

const TOKENS_KEY = 'hp_tokens';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = new CognitoIdentityProviderClient({
    region: environment.cognito.region,
  });

  private readonly _tokens = signal<StoredTokens | null>(this.loadFromStorage());

  readonly isAuthenticated = computed(() => {
    const t = this._tokens();
    return !!t && Date.now() < t.expiresAt;
  });

  // ─── Auth flows ────────────────────────────────────────────────────────────

  async signIn(email: string, password: string): Promise<void> {
    const { AuthenticationResult } = await this.client.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: environment.cognito.clientId,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }),
    );
    this.persist(AuthenticationResult!, null);
  }

  async signUp(email: string, password: string, name: string, birthdate: string): Promise<void> {
    await this.client.send(
      new SignUpCommand({
        ClientId: environment.cognito.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email',      Value: email },
          { Name: 'name',       Value: name },
          { Name: 'birthdate',  Value: birthdate },
        ],
      }),
    );
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await this.client.send(
      new ConfirmSignUpCommand({
        ClientId: environment.cognito.clientId,
        Username: email,
        ConfirmationCode: code,
      }),
    );
  }

  async refreshSession(): Promise<void> {
    const stored = this._tokens();
    if (!stored?.refreshToken) throw new Error('No refresh token');

    const { AuthenticationResult } = await this.client.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: environment.cognito.clientId,
        AuthParameters: { REFRESH_TOKEN: stored.refreshToken },
      }),
    );
    // Cognito doesn't return a new refresh token in this flow
    this.persist(AuthenticationResult!, stored.refreshToken);
  }

  async getCurrentUser(): Promise<any> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return this.client.send(new GetUserCommand({ AccessToken: token }));
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.send(
      new ForgotPasswordCommand({
        ClientId: environment.cognito.clientId,
        Username: email,
      }),
    );
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    await this.client.send(
      new ConfirmForgotPasswordCommand({
        ClientId: environment.cognito.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      }),
    );
  }

  async signOut(): Promise<void> {
    const token = this.getAccessToken();
    if (token) {
      try {
        await this.client.send(new GlobalSignOutCommand({ AccessToken: token }));
      } catch {
        // Continue with local logout even if Cognito fails
      }
    }
    this.clear();
  }

  // ─── Token helpers ─────────────────────────────────────────────────────────

  getAccessToken(): string | null {
    return this._tokens()?.accessToken ?? null;
  }

  hasRefreshToken(): boolean {
    return !!this._tokens()?.refreshToken;
  }

  isTokenExpired(): boolean {
    const t = this._tokens();
    return !t || Date.now() >= t.expiresAt;
  }

  // ─── Storage ───────────────────────────────────────────────────────────────

  private persist(result: AuthenticationResultType, fallbackRefresh: string | null): void {
    const tokens: StoredTokens = {
      accessToken: result.AccessToken!,
      idToken: result.IdToken!,
      refreshToken: result.RefreshToken ?? fallbackRefresh!,
      expiresAt: Date.now() + (result.ExpiresIn ?? 3600) * 1000,
    };
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    this._tokens.set(tokens);
  }

  private clear(): void {
    localStorage.removeItem(TOKENS_KEY);
    this._tokens.set(null);
  }

  private loadFromStorage(): StoredTokens | null {
    try {
      const raw = localStorage.getItem(TOKENS_KEY);
      return raw ? (JSON.parse(raw) as StoredTokens) : null;
    } catch {
      return null;
    }
  }
}
