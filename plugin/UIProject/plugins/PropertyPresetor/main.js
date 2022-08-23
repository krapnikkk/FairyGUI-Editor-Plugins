"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const App = csharp_1.FairyEditor.App;
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/PropertyPresetor');
csharp_1.FairyGUI.UIObjectFactory.SetPackageItemExtension("ui://PropertyPresetor/item", () => new Item);
let filePath = `${csharp_1.FairyEditor.App.project.basePath}/plugins/PropertyPresetor/config.json`;
let config;
try {
    let sw = new csharp_1.System.IO.StreamReader(filePath);
    let data = sw.ReadToEnd();
    sw.Close();
    // console.log("获取到本地配置:", data);
    config = JSON.parse(data);
}
catch (e) {
    console.warn(e);
}
if (config.remote) {
    // remote
    let url = config.remote;
    let request = csharp_1.System['Net']['WebRequest'].Create(url);
    request.Method = "GET";
    request.ContentType = "text/html;charset=UTF-8";
    let response = request.GetResponse();
    let responseStream = response.GetResponseStream();
    let streamReader = new csharp_1.System.IO.StreamReader(responseStream);
    let res = streamReader.ReadToEnd();
    try {
        console.log("获取到远程配置：", config);
        config = JSON.parse(res);
    }
    catch (e) {
        console.warn(e);
    }
}
class Item extends csharp_1.FairyGUI.GButton {
    constructor() {
        super();
        console.log("constructor");
    }
    ConstructFromXML($xml) {
        super.ConstructFromXML($xml);
        console.log("ConstructFromXML");
    }
    Setup_BeforeAdd($buffer, $beginPos) {
        super.Setup_BeforeAdd($buffer, $beginPos);
        console.log("Setup_BeforeAdd");
    }
}
class PropertyPresetor extends csharp_1.FairyEditor.View.PluginInspector {
    list;
    constructor(content) {
        super();
        console.log(JSON.stringify(content));
        this.panel = csharp_1.FairyGUI.UIPackage.CreateObject("PropertyPresetor", "Main");
        this.list = this.panel.GetChild("list");
        this.list.numItems = content.length;
        // this.list.onClickItem.Add();
        // this.btn_reset.onClick.Add(() => {
        //     this.showList(true);
        // })
        this.updateAction = () => { return this.updateUI(); };
    }
    lastSelectedComponent = "";
    lastData = "";
    updateUI() {
        return true;
    }
}
for (let i = 0; i < config.list.length; i++) {
    let item = config.list[i];
    let { parent, content } = item;
    App.inspectorView.AddInspector(() => new PropertyPresetor(content), "元件属性配置预设", "元件属性配置预设");
    App.docFactory.ConnectInspector("元件属性配置预设", "mixed", parent, false);
}
