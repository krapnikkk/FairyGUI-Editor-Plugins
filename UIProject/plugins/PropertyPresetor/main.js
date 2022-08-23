"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const puerts_1 = require("puerts");
const App = csharp_1.FairyEditor.App;
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
function updateAttribute(key, value, obj) {
    let newValue;
    let attrObj = null;
    if (key.toLocaleLowerCase().indexOf("color") > -1) {
        newValue = csharp_1.FairyEditor.ColorUtil.FromHexString(value);
    }
    else if (key == "shadowOffset") {
        let arr = value.split(",");
        attrObj = {
            shadowX: +arr[0],
            shadowY: +arr[1]
        };
    }
    else {
        newValue = value;
    }
    if (newValue) {
        obj.docElement.SetProperty(key, newValue);
    }
    else {
        for (let item in attrObj) {
            obj.docElement.SetProperty(item, attrObj[item]);
        }
    }
}
class ListItem extends csharp_1.FairyGUI.GComponent {
    constructor() {
        super();
    }
    ConstructFromXML($xml) {
        super.ConstructFromXML($xml);
    }
    Setup_BeforeAdd($buffer, $beginPos) {
        super.Setup_BeforeAdd($buffer, $beginPos);
    }
    init(content) {
        let { title, attributes } = content;
        this.GetChild("title").text = title;
        let valueArr = csharp_1.System.Array.CreateInstance((0, puerts_1.$typeof)(csharp_1.System.String), attributes.length);
        let itemArr = csharp_1.System.Array.CreateInstance((0, puerts_1.$typeof)(csharp_1.System.String), attributes.length);
        for (let i = 0; i < attributes.length; i++) {
            let v = attributes[i].name;
            valueArr.set_Item(i, v);
            itemArr.set_Item(i, v);
        }
        let component = this.GetChild("component");
        component.items = itemArr;
        component.values = valueArr;
        component.value = attributes[0].name;
        this.GetChild("btn_apply").onClick.Add(() => {
            let curVal = component.value;
            attributes.forEach(attribute => {
                let { presets, name } = attribute;
                if (name == curVal) {
                    presets.forEach((preset) => {
                        let { key, value } = preset;
                        let obj = App.activeDoc.inspectingTarget;
                        updateAttribute(key, value, obj);
                    });
                }
            });
        });
    }
}
class PropertyPresetor extends csharp_1.FairyEditor.View.PluginInspector {
    list;
    content;
    pattern;
    constructor(content, pattern) {
        super();
        this.content = content;
        this.pattern = pattern;
        this.panel = csharp_1.FairyGUI.UIPackage.CreateObject("PropertyPresetor", "Main");
        this.list = this.panel.GetChild("list");
        this.list.itemRenderer = this.itemRenderer.bind(this);
        this.list.numItems = content.length;
        this.list.ResizeToFit();
        this.updateAction = () => { return this.updateUI(); };
    }
    itemRenderer(idx, item) {
        let data = this.content[idx];
        item.init(data);
    }
    updateUI() {
        let visivle = this.pattern.some((val) => {
            let obj = App.activeDoc.inspectingTarget;
            let type = obj.GetType().ToString().toLowerCase();
            return type.indexOf(val) > -1;
        });
        return visivle;
    }
}
csharp_1.FairyGUI.UIObjectFactory.SetPackageItemExtension("ui://PropertyPresetor/item", () => new ListItem);
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/PropertyPresetor');
for (let i = 0; i < config.list.length; i++) {
    let item = config.list[i];
    let { parent, content, pattern } = item;
    App.inspectorView.AddInspector(() => new PropertyPresetor(content, pattern), "元件属性配置预设", "元件属性配置预设");
    App.docFactory.ConnectInspector("元件属性配置预设", "mixed", parent, false);
}
