"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const lsp_1 = require("./lsp");
let langserver = null;
const activate = function () {
    langserver = new lsp_1.HaskellLanguageServer();
};
exports.activate = activate;
const deactivate = function () {
    if (langserver) {
        langserver.stop();
        langserver = null;
    }
};
exports.deactivate = deactivate;
nova.commands.register("haskell.restart", (_) => restartCommand(langserver));
async function restartCommand(languageServer) {
    console.log("Restarting language server");
    if (!languageServer) {
        console.log("Language Server not running");
    }
    else {
        languageServer.stop();
        languageServer.start();
    }
}
