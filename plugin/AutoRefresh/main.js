"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const fxparser = require("./fast-xml-parser/index.js");
const App = csharp_1.FairyEditor.App;
const parseOptions = {
    "alwaysCreateTextNode": false,
    "attributeNamePrefix": "@_",
    "attributesGroupName": false,
    "textNodeName": "#text",
    "ignoreAttributes": false,
    "removeNSPrefix": true,
    "parseNodeValue": true,
    "parseAttributeValue": true,
    "allowBooleanAttributes": false,
    "trimValues": true,
    "cdataTagName": "#cdata",
    "preserveOrder": false,
    "numberParseOptions": {
        "hex": false,
        "leadingZeros": true
    }
};
const buildOptions = {
    "attributeNamePrefix": "@_",
    "attributesGroupName": false,
    "textNodeName": "#text",
    "ignoreAttributes": false,
    "cdataTagName": "#cdata",
    "format": true,
    "indentBy": "  ",
    "suppressEmptyNode": false,
    "suppressBooleanAttributes": false,
    "preserveOrder": false
};
const parser = new fxparser.XMLParser(parseOptions);
const builder = new fxparser.XMLBuilder(buildOptions);
function updateFile(pkg) {
    // let pkgName = pkg.name;
    let pkgPath = `${pkg.basePath}/package.xml`;
    // read
    let sr = new csharp_1.System.IO.StreamReader(pkgPath);
    let data = sr.ReadToEnd();
    sr.Close();
    let json = parser.parse(data);
    let resources = json.packageDescription.resources;
    if (resources) {
        for (let key in resources) {
            // 使用id重新排序
            let res = resources[key];
            if (res && res.length >= 1) {
                res = sortList(res);
            }
        }
        let xmlContent = builder.build(json);
        xmlContent = xmlContent.replace(`<?xml version="1.0"?>`, "")
            .replace(`<?xml version="1" encoding="utf-8"?>`, `<?xml version="1.0" encoding="utf-8"?>\n`);
        // write
        if (data !== xmlContent) {
            let wr = new csharp_1.System.IO.StreamWriter(pkgPath);
            wr.Write(xmlContent);
            wr.Close();
        }
    }
}
function sortList(arr) {
    return arr.sort((a, b) => a["@_id"].localeCompare(b["@_id"]));
}
let preActive = App.isActive;
let onUpdate = function () {
    var active = App.isActive;
    if (preActive == active) {
        return;
    }
    preActive = active;
    if (active) {
        console.log("检测到从后台返回, 自动刷新资源列表");
        App.RefreshProject();
        let pkgs = App.project.allPackages;
        for (let i = 0; i < pkgs.Count; i++) {
            let pkg = pkgs.get_Item(i);
            updateFile(pkg);
        }
    }
};
App.add_onUpdate(onUpdate);
const onDestroy = function () {
    App.remove_onUpdate(onUpdate);
};
exports.default = onDestroy;
