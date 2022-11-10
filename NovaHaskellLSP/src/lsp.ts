const defaultLspPath = '/usr/bin/hls';

// [name, defaultValue]
const initializationOptions: Array<[string, any]> = [
    // ["haskell.plugin.ghcide-completions.completionOn", true]
];

function readConfig<T>(name: string, defaultValue: T): T {
    return nova.config.get(name) as T | null ?? defaultValue;
}

function getInitializationOptions(): Object {
    const options: Array<[string, any]> = initializationOptions.map(([name, defaultValue], _) => [name, defaultValue]);
    return Object.fromEntries(options);
}



export class HaskellLanguageServer {
    languageClient: LanguageClient | null = null;
    
    constructor() {
        nova.config.observe(
            'haskell.language-server-path', 
            function(this: HaskellLanguageServer, newPath: string, _: string) { this.start() },
            this
        );
        
    }
    
    deactivate() {
        this.stop();
    }
    
    start() {
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
        }
        let path = nova.config.get("haskell.language-server-path") as string | null ?? defaultLspPath;
        path = nova.path.normalize(path)
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
        const client = new LanguageClient(
            'haskell-langserver', 
            nova.extension.name,
            serverOptions, 
            clientOptions
        );
        try {
            // Start the client
            client.start();
            // Add the client to the subscriptions to be cleaned up
            nova.subscriptions.add(client);
            this.languageClient = client;
        } catch (err) {
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