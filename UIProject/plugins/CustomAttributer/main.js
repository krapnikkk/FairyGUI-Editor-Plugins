"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const index_1 = require("./index");
const App = csharp_1.FairyEditor.App;
// 首先读取本地文件配置获取是否本地配置还是远程配置
// local
let filePath = `${csharp_1.FairyEditor.App.project.basePath}/plugins/CustomAttributer/config.json`;
let config;
try {
    let sw = new csharp_1.System.IO.StreamReader(filePath);
    let data = sw.ReadToEnd();
    sw.Close();
    console.log("获取到本地配置:", data);
    config = JSON.parse(data);
}
catch (e) {
    console.warn(e);
}
if (config.remote) {
    console.log("访问线上配置文件");
    // remote
    let url = config.remote || "https://oss.ixald.com/CClient/platform/BigWatermelon/res/jsons/signConfig.json";
    let request = csharp_1.System['Net']['WebRequest'].Create(url);
    request.Method = "GET";
    request.ContentType = "text/html;charset=UTF-8";
    let response = request.GetResponse();
    let responseStream = response.GetResponseStream();
    let streamReader = new csharp_1.System.IO.StreamReader(responseStream);
    let res = streamReader.ReadToEnd();
    try {
        config = JSON.parse(res);
        console.log("获取到线上配置：", config);
    }
    catch (e) {
        console.warn(e);
    }
}
let { parent, pattern, components, mode } = config;
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/CustomAttributer');
class CustomAttributer extends csharp_1.FairyEditor.View.PluginInspector {
    list;
    components = [];
    textMode;
    mode;
    modeCtr;
    constructor() {
        super();
        this.panel = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", "Main").asCom;
        this.components = components;
        this.list = this.panel.GetChild("list_components").asList;
        this.textMode = this.panel.GetChild("text_mode").asTextField;
        this.mode = mode;
        this.list.numItems = 0;
        this.modeCtr = this.panel.GetController("op");
        if (this.mode == index_1.EMode.WRITE) {
            this.textMode.SetVar("mode", "设置").FlushVars();
            this.modeCtr.SetSelectedPage("write");
        }
        else {
            this.textMode.SetVar("mode", "读取").FlushVars();
            this.modeCtr.SetSelectedPage("read");
        }
        for (let item of this.components) {
            let { type, name, defaultVal, id } = item;
            let com = getComponent(type);
            if (!name) {
                name = "未定义名称";
            }
            if (!com) {
                console.log("发现未定义扩展组件ID：", id);
            }
            if (com.hasOwnProperty("title")) {
                com.asButton.title = name;
            }
            if (!defaultVal) {
                defaultVal = "";
            }
            const component = com.GetChild("component");
            if (component instanceof csharp_1.FairyGUI.GComboBox && item.type == index_1.EComponent.COMBOBOX) {
                let { data } = item;
                let { values, items } = data;
                console.log(values, items);
                console.log("GComboBox:", component);
                // component.items = [];
                // component.values = [];
                // component.items = items;
                // component.values = values;
            }
            else {
                component.text = defaultVal;
            }
            this.list.AddChild(com);
        }
        this.list.ResizeToFit();
        this.updateAction = () => { return this.updateUI(); };
    }
    showList() {
    }
    updateUI() {
        // 根据匹配规则验证是否显示inspector
        // 正则 & 字符串 通配符
        let name = parent ? App.activeDoc.displayTitle : App.activeDoc.inspectingTarget.name;
        pattern = !pattern ? "*" : pattern;
        return isMatch(name, pattern);
    }
    setCustomData(data) {
        let propName = parent ? "customData" : "remark";
        App.activeDoc.inspectingTarget.SetProperty(propName, data);
    }
}
//Register a inspector
App.inspectorView.AddInspector(() => new CustomAttributer(), "CustomAttributerJS", "CustomAttributer");
//Condition to show it
App.docFactory.ConnectInspector("CustomAttributerJS", "mixed", parent, false);
/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
let isCharacterMatch = (s, p) => {
    let dp = [];
    for (let i = 0; i <= s.length; i++) {
        let child = [];
        for (let j = 0; j <= p.length; j++) {
            child.push(false);
        }
        dp.push(child);
    }
    dp[s.length][p.length] = true;
    // 执行
    for (let i = p.length - 1; i >= 0; i--) {
        if (p[i] != "*")
            break;
        else
            dp[s.length][i] = true;
    }
    for (let i = s.length - 1; i >= 0; i--) {
        for (let j = p.length - 1; j >= 0; j--) {
            if (s[i] == p[j] || p[j] == "?") {
                dp[i][j] = dp[i + 1][j + 1];
            }
            else if (p[j] == "*") {
                dp[i][j] = dp[i + 1][j] || dp[i][j + 1];
            }
            else {
                dp[i][j] = false;
            }
        }
    }
    return dp[0][0];
};
let isRegMatch = (source, pattern) => {
    const patt = new RegExp(pattern);
    return patt.test(source);
};
let isMatch = (source, pattern) => {
    if (pattern.includes("*") || pattern.includes("?")) {
        return isCharacterMatch(source, pattern);
    }
    else if (pattern.includes("/")) {
        return isRegMatch(source, pattern);
    }
    else {
        return source.includes(pattern);
    }
};
let getComponent = (componentType) => {
    let component;
    switch (componentType) {
        case index_1.EComponent.TEXTINPUT:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.TEXTINPUT).asCom;
            break;
        case index_1.EComponent.TEXTAREA:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.TEXTAREA).asCom;
            break;
        case index_1.EComponent.COMBOBOX:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.COMBOBOX).asCom;
            break;
        case index_1.EComponent.COLORINPUT:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.COLORINPUT).asCom;
            break;
        default:
            break;
    }
    return component;
};
