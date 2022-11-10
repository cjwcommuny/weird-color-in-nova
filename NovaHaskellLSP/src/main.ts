import { HaskellLanguageServer } from "./lsp"

let langserver: HaskellLanguageServer | null = null;

export const activate = function() {
    langserver = new HaskellLanguageServer();
}

export const deactivate = function() {
    if (langserver) {
        langserver.stop();
        langserver = null;
    }
}

nova.commands.register(
    "haskell.restart",
    (_: Workspace) => restartCommand(langserver)
)

async function restartCommand(languageServer: HaskellLanguageServer | null) {
    console.log("Restarting language server");
    if (!languageServer) {
        console.log("Language Server not running");
    } else {
        languageServer.stop();
        languageServer.start();
    }
}