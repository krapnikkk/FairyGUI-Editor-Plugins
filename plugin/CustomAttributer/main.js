"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const puerts_1 = require("puerts");
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
let { parent, pattern, components, mode, title } = config;
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/CustomAttributer');
class CustomAttributer extends csharp_1.FairyEditor.View.PluginInspector {
    list;
    components = [];
    textMode;
    mode;
    modeCtr;
    btn_save;
    btn_reset;
    customData = "";
    customDataObj = {};
    constructor() {
        super();
        this.panel = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", "Main").asCom;
        this.components = components;
        this.list = this.panel.GetChild("list_components").asList;
        this.textMode = this.panel.GetChild("text_mode").asTextField;
        this.mode = mode || index_1.EMode.WRITE; // todo
        if (this.components.length > 0) {
            this.list.numItems = 0;
        }
        this.modeCtr = this.panel.GetController("op");
        this.btn_save = this.panel.GetChild("btn_save").asButton;
        this.btn_save.onClick.Add(() => {
            this.setCustomData();
        });
        this.btn_reset = this.panel.GetChild("btn_reset").asButton;
        this.btn_reset.onClick.Add(() => {
            this.showList(true);
        });
        this.updateAction = () => { return this.updateUI(); };
    }
    lastSelectedComponent = "";
    lastData = "";
    updateUI() {
        let curDoc = App.activeDoc;
        let { inspectingTarget } = curDoc;
        let id = inspectingTarget.id;
        // 实时获取自定义数据
        let propName = parent ? "remark" : "customData";
        this.customData = inspectingTarget.GetProperty(propName);
        try {
            this.customDataObj = JSON.parse(this.customData) || {};
        }
        catch (e) {
            // console.log("自定义数据异常或没有发现自定义数据，无法渲染列表");
            this.customDataObj = {};
        }
        // 根据匹配规则验证是否显示inspector
        // 正则 & 字符串 通配符
        let name = parent ? curDoc.displayTitle : inspectingTarget.name;
        pattern = !pattern ? "*" : pattern;
        let flag = isMatch(name, pattern);
        if ((flag && this.lastSelectedComponent != id) || this.customData !== this.lastData) { // 判断是否满足条件的组件以及是上一次选中的组件或者数据是否被修改
            this.showList();
        }
        this.lastData = this.customData;
        this.lastSelectedComponent = id;
        return flag;
    }
    showList(reset = false) {
        this.list.numItems = 0;
        // todo
        // if (this.mode == EMode.WRITE) {
        // this.textMode.SetVar("mode", "设置").FlushVars();
        // this.modeCtr.SetSelectedPage("write");
        // } else {
        //     this.textMode.SetVar("mode", "读取").FlushVars();
        //     this.modeCtr.SetSelectedPage("read");
        // }
        // 根据自定义属性和配置文件混合比较【以自定义属性为主】渲染列表数据 
        for (let item of this.components) {
            let { type, name, id, key } = item;
            let com = getComponent(type);
            if (!key) {
                console.log("未定义唯一keyID：", id);
                return;
            }
            if (!com) {
                console.log("发现未定义扩展组件，ID：", id);
            }
            com.title = name || key;
            const component = com.GetChild("component");
            this.renderItem(component, item, reset);
            this.list.AddChild(com);
        }
        this.list.ResizeToFit();
    }
    renderItem(component, item, reset) {
        let { value, key } = item;
        if (!reset) {
            let defaultVal = this.getValueByName(key);
            value = defaultVal != undefined ? defaultVal : value;
        }
        // 下拉框
        if (component instanceof csharp_1.FairyGUI.GComboBox && item.type == index_1.EComponent.COMBOBOX) {
            let data = item.data;
            let valueArr = csharp_1.System.Array.CreateInstance((0, puerts_1.$typeof)(csharp_1.System.String), data.values.length);
            for (let i = 0; i < data.values.length; i++) {
                let v = data.values[i];
                valueArr.set_Item(i, v);
            }
            let itemArr = csharp_1.System.Array.CreateInstance((0, puerts_1.$typeof)(csharp_1.System.String), data.items.length);
            for (let i = 0; i < data.items.length; i++) {
                let v = data.items[i];
                itemArr.set_Item(i, v);
            }
            component.items = itemArr;
            component.values = valueArr;
            component.value = itemArr[+value || 0];
        }
        else if (component instanceof csharp_1.FairyGUI.GLabel &&
            (item.type == index_1.EComponent.TEXTINPUT ||
                item.type == index_1.EComponent.TEXTAREA ||
                item.type == index_1.EComponent.RESOURCEINPUT)) { // 文本输入框
            component.title = value + "" || "";
        }
        else if (item.type == index_1.EComponent.COLORINPUT && component instanceof csharp_1.FairyEditor.Component.ColorInput) { // 颜色输入框
            let colorValue = value + "" || "#000000";
            component.colorValue = csharp_1.FairyEditor.ColorUtil.FromHexString(colorValue);
        }
        else if (component instanceof csharp_1.FairyGUI.GSlider && item.type == index_1.EComponent.SLIDER) { // 滑动块
            let data = item.data;
            component.min = +data.min || 0;
            component.max = +data.max || 100;
            component.value = +value || 0;
        }
        else if (component instanceof csharp_1.FairyEditor.Component.NumericInput && item.type == index_1.EComponent.NUMBERINPUT) { // 数字输入框
            let data = item.data;
            component.min = +data.min || 0;
            component.max = +data.max || 100;
            component.step = +data.step || 0;
            component.value = +value || 0;
        }
        else if (component instanceof csharp_1.FairyGUI.GButton && item.type == index_1.EComponent.SWITCH) { // 切换器
            component.selected = Boolean(value);
        }
        else if (component instanceof csharp_1.FairyGUI.GButton && item.type == index_1.EComponent.RADIOBOX) { // 单选框
            let data = item.data;
            component.GetChildAt(0).text = data.items[0];
            component.GetChildAt(1).text = data.items[1];
            component.selected = Boolean(value);
        }
    }
    getListItemVal() {
        for (let i = 0; i < this.list.numChildren; i++) {
            let item = this.list.GetChildAt(i);
            let component = item.GetChild("component");
            let value = component.title;
            if (component instanceof csharp_1.FairyEditor.Component.ColorInput) {
                value = csharp_1.FairyEditor.ColorUtil.ToHexString(component.colorValue);
            }
            else if (component instanceof csharp_1.FairyGUI.GComboBox) {
                value = component.selectedIndex;
            }
            else if (component instanceof csharp_1.FairyEditor.Component.NumericInput) {
                value = component.value;
            }
            else if (components[i].type == index_1.EComponent.SWITCH) {
                value = component.selected;
            }
            else if (components[i].type == index_1.EComponent.RADIOBOX) {
                value = component.selected ? 1 : 0;
            }
            else if (components[i].type == index_1.EComponent.SLIDER) {
                value = component.value;
            }
            let key = components[i].key;
            if (this.customDataObj) {
                this.customDataObj[key] = value;
            }
        }
        return JSON.stringify(this.customDataObj) || "";
    }
    getValueByName(name) {
        // let value = "";
        // if (this.customDataObj?.[name]) {
        //     value = this.customDataObj[name];
        // }
        // return value;
        return this.customDataObj[name];
    }
    setCustomData() {
        let propName = parent ? "remark" : "customData";
        let data = this.getListItemVal();
        App.activeDoc.inspectingTarget.docElement.SetProperty(propName, data);
    }
}
App.inspectorView.AddInspector(() => new CustomAttributer(), "CustomAttributer", title);
App.docFactory.ConnectInspector("CustomAttributer", "mixed", parent, false);
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
        case index_1.EComponent.NUMBERINPUT:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.NUMBERINPUT).asCom;
            break;
        case index_1.EComponent.RESOURCEINPUT:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.RESOURCEINPUT).asCom;
            break;
        case index_1.EComponent.SLIDER:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.SLIDER).asCom;
            break;
        case index_1.EComponent.RADIOBOX:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.RADIOBOX).asCom;
            break;
        case index_1.EComponent.SWITCH:
            component = csharp_1.FairyGUI.UIPackage.CreateObject("CustomAttributer", index_1.EComponent.SWITCH).asCom;
            break;
        default:
            break;
    }
    return component;
};
