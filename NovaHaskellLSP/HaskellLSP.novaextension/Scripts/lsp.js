"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaskellLanguageServer = void 0;
const defaultLspPath = '/usr/bin/hls';
// [name, defaultValue]
const initializationOptions = [
// ["haskell.plugin.ghcide-completions.completionOn", true]
];
function readConfig(name, defaultValue) {
    var _a;
    return (_a = nova.config.get(name)) !== null && _a !== void 0 ? _a : defaultValue;
}
function getInitializationOptions() {
    const options = initializationOptions.map(([name, defaultValue], _) => [name, defaultValue]);
    return Object.fromEntries(options);
}
class HaskellLanguageServer {
    constructor() {
        this.languageClient = null;
        nova.config.observe('haskell.language-server-path', function (newPath, _) { this.start(); }, this);
    }
    deactivate() {
        this.stop();
    }
    start() {
        var _a;
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
        }
        let path = (_a = nova.config.get("haskell.language-server-path")) !== null && _a !== void 0 ? _a : defaultLspPath;
        path = nova.path.normalize(path);
        console.log("LSP path: " + path);
        const workspacePath = nova.workspace.path;
        if (!workspacePath) {
            console.error("nova.workspace.path is null");
            return;
        }
        const serverOptions = {
            path,
            args: ["--lsp", "--cwd", workspacePath]
        };
        const clientOptions = {
            // The set of document syntaxes for which the server is valid
            syntaxes: ['haskell'],
            initializationOptions: getInitializationOptions()
        };
        const client = new LanguageClient('haskell-langserver', nova.extension.name, serverOptions, clientOptions);
        try {
            // Start the client
            client.start();
            // Add the client to the subscriptions to be cleaned up
            nova.subscriptions.add(client);
            this.languageClient = client;
        }
        catch (err) {
            // If the .start() method throws, it's likely because the path to the language server is invalid
            if (nova.inDevMode()) {
                console.error(err);
            }
        }
        console.log("start LSP");
    }
    stop() {
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
            this.languageClient = null;
        }
    }
}
exports.HaskellLanguageServer = HaskellLanguageServer;
