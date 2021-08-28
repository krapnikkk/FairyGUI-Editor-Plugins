import { getversion } from "./getVersion";

let config = {
    buildConfig: params => {
        console.log("+++", __dirname);
        return {
            define: { VERSION: getversion() },
            outfile: "js/bundle.js",
            plugins: [new polea.ESBundlePlugin({})],
        };
    },
};

export default config;
