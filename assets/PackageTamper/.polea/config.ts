import { getversion } from "./getVersion";

let config: polea.ConfigManager = {
    buildConfig: (params: polea.ConfigCommand) => {
        let { command } = params;
        if (command == "compile") {//polea compile
            return {
                define: { DEBUG: true, RELEASE: false },
                watch: false,
                output: "./bin",
                plugins: [new polea.ESBundlePlugin({ sourcemap: true })],
            };
        } else if (command == "publish") {//polea publish
            return {
                define: { DEBUG: true, RELEASE: false },
                watch: false,
                output: "./release/" + getversion(),
                plugins: [new polea.ESBundlePlugin({ sourcemap: false, minify: true })],
            };
        }
    },
};
export default config;
