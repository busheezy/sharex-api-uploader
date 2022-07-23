import { window, ExtensionContext, commands, workspace, env } from "vscode";
import AuthSettings from "./AuthSettings";
import { Axios } from "axios";
import * as FormData from "form-data";

const axios = new Axios({});

export async function activate(context: ExtensionContext) {
  AuthSettings.init(context);
  const settings = AuthSettings.instance;

  const registerShare = commands.registerCommand(
    "sharex-api-uploader.share",
    async () => {
      if (!window.activeTextEditor) {
        window.showErrorMessage("No open text document to upload.");
        return;
      }

      const currentText = window.activeTextEditor.document.getText();

      const authSecret = await settings.getOrSetAuthSecret();
      const apiUrl = workspace.getConfiguration().get<string>("share.apiUrl");
      const responseUrl = workspace
        .getConfiguration()
        .get<string>("share.responseUrl");

      if (!apiUrl) {
        window.showErrorMessage("API URL is not set.");
        return false;
      }

      if (!authSecret) {
        window.showErrorMessage("Auth secret not set!");
        return false;
      }

      if (!responseUrl) {
        window.showErrorMessage("Auth secret not set!");
        return false;
      }

      const form = new FormData();
      form.append(
        "paste",
        currentText,
        window.activeTextEditor.document.fileName
      );

      try {
        const { data: paste } = await axios.request({
          method: "post",
          url: apiUrl,
          data: form,
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Content-Type": "mutipart/form-data",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "X-API-Key": authSecret,
          },
          responseType: "text",
        });

        window.showInformationMessage(paste);
        window.showInformationMessage(typeof paste);

        const pasteObj = JSON.parse(paste);
        const { stringId } = pasteObj;
        const fullResponseUrl = `${responseUrl}/${stringId}`;

        env.clipboard.writeText(fullResponseUrl);
        window.showInformationMessage("Paste uploaded");
      } catch (err) {
        window.showErrorMessage(`Error while uploading.\n${err}`);
      }
    }
  );

  const setSecret = commands.registerCommand(
    "sharex-api-uploader.setSecret",
    async () => {
      const authSecret = await settings.inputAuthSecret();

      if (!authSecret) {
        window.showErrorMessage("Auth secret not set!");
        return;
      }

      window.showInformationMessage("Auth secret saved!");
    }
  );

  context.subscriptions.push(registerShare);
  context.subscriptions.push(setSecret);
}

export function deactivate() {}
