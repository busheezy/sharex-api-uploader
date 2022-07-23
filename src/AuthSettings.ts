import { ExtensionContext, SecretStorage, window } from "vscode";

const API_SECRET_KEY = "API_SECRET_KEY";

export default class AuthSettings {
  private static _instance: AuthSettings;

  constructor(private secretStorage: SecretStorage) {}

  static init(context: ExtensionContext): void {
    AuthSettings._instance = new AuthSettings(context.secrets);
  }

  static get instance(): AuthSettings {
    return AuthSettings._instance;
  }

  setAuthSecret(token: string): Thenable<void> {
    return this.secretStorage.store(API_SECRET_KEY, token);
  }

  getAuthSecret(): Thenable<string | undefined> {
    return this.secretStorage.get(API_SECRET_KEY);
  }

  async inputAuthSecret() {
    const secretInput = await window.showInputBox({
      title: "Secret",
      prompt: "Enter your API secret.",
    });

    if (!secretInput) {
      return undefined;
    }

    await this.setAuthSecret(secretInput);

    return secretInput;
  }

  async getOrSetAuthSecret(): Promise<string | undefined> {
    const savedAuthSecret = await this.getAuthSecret();

    if (savedAuthSecret) {
      return savedAuthSecret;
    } else {
      return this.inputAuthSecret();
    }
  }
}
