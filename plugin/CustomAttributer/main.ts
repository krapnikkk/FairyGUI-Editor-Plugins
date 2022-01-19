import { FairyGUI, FairyEditor, System } from 'csharp';
import { $generic, $typeof } from 'puerts';
import { IConfig, IComponent, EComponent, EMode } from './index';

const App = FairyEditor.App;
// 首先读取本地文件配置获取是否本地配置还是远程配置
// local
let filePath = `${FairyEditor.App.project.basePath}/plugins/CustomAttributer/config.json`;
let config: IConfig;
try {
    let sw = new System.IO.StreamReader(filePath);
    let data = sw.ReadToEnd();
    sw.Close();
    console.log("获取到本地配置:", data);
    config = JSON.parse(data);
} catch (e) {
    console.warn(e);
}
if (config.remote) {
    // remote
    let url = config.remote;
    let request = System['Net']['WebRequest'].Create(url);
    request.Method = "GET";
    request.ContentType = "text/html;charset=UTF-8";
    let response = request.GetResponse();
    let responseStream = response.GetResponseStream();
    let streamReader = new System.IO.StreamReader(responseStream);
    let res = streamReader.ReadToEnd();
    try {
        console.log("获取到远程配置：", config);
        config = JSON.parse(res);
    } catch (e) {
        console.warn(e);
    }
}


let { parent, pattern, components, mode, title } = config;
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/CustomAttributer')

class CustomAttributer extends FairyEditor.View.PluginInspector {
    private list: FairyGUI.GList;
    private components: IComponent[] = [];
    private textMode: FairyGUI.GTextField;
    private mode: EMode;
    private modeCtr: FairyGUI.Controller;
    private btn_save: FairyGUI.GButton;
    private btn_reset: FairyGUI.GButton;
    private customData: string = "";
    private customDataObj: {} = {};

    public constructor() {
        super();

        this.panel = FairyGUI.UIPackage.CreateObject("CustomAttributer", "Main").asCom;
        this.components = components;
        this.list = this.panel.GetChild("list_components").asList;
        this.textMode = this.panel.GetChild("text_mode").asTextField;
        this.mode = mode || EMode.WRITE; // todo
        if (this.components.length > 0) {
            this.list.numItems = 0;
        }
        this.modeCtr = this.panel.GetController("op");

        this.btn_save = this.panel.GetChild("btn_save").asButton;
        this.btn_save.onClick.Add(() => {
            this.setCustomData();
        })

        this.btn_reset = this.panel.GetChild("btn_reset").asButton;
        this.btn_reset.onClick.Add(() => {
            this.showList(true);
        })

        this.updateAction = () => { return this.updateUI(); };
    }

    private lastSelectedComponent: string = "";
    private lastData: string = "";
    private updateUI(): boolean {
        let curDoc = App.activeDoc;
        let { inspectingTarget } = curDoc;

        let id = inspectingTarget.id;
        // 实时获取自定义数据
        let propName = parent ? "remark" : "customData";
        this.customData = inspectingTarget.GetProperty(propName);
        try {
            this.customDataObj = JSON.parse(this.customData) || {};
        } catch (e) {
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

    private showList(reset: boolean = false) {
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
                return
            }
            if (!com) {
                console.log("发现未定义扩展组件，ID：", id);
            }

            (<FairyGUI.GButton>com).title = name || key;
            const component = com.GetChild("component");

            this.renderItem(component, item, reset);
            this.list.AddChild(com);
        }
        this.list.ResizeToFit();
    }

    private renderItem(component: FairyGUI.GObject, item: IComponent,reset:boolean) {
        let { value, key } = item;
        if(!reset){
            let defaultVal = this.getValueByName(key);
            value = defaultVal != undefined ? defaultVal : value;
        }
        // 下拉框
        if (component instanceof FairyGUI.GComboBox && item.type == EComponent.COMBOBOX) {
            let data = item.data;
            let valueArr = System.Array.CreateInstance($typeof(System.String), data.values.length) as System.Array$1<string>;
            for (let i = 0; i < data.values.length; i++) {
                let v = data.values[i];
                valueArr.set_Item(i, v);
            }

            let itemArr = System.Array.CreateInstance($typeof(System.String), data.items.length) as System.Array$1<string>;
            for (let i = 0; i < data.items.length; i++) {
                let v = data.items[i];
                itemArr.set_Item(i, v);
            }

            component.items = itemArr;
            component.values = valueArr;
            component.value = itemArr[+value || 0];

        } else if (component instanceof FairyGUI.GLabel &&
            (
                item.type == EComponent.TEXTINPUT ||
                item.type == EComponent.TEXTAREA ||
                item.type == EComponent.RESOURCEINPUT
            )) { // 文本输入框
            component.title = value + "" || "";
        } else if (item.type == EComponent.COLORINPUT && component instanceof FairyEditor.Component.ColorInput) { // 颜色输入框
            let colorValue = value + "" || "#000000";
            component.colorValue = FairyEditor.ColorUtil.FromHexString(colorValue);
        } else if (component instanceof FairyGUI.GSlider && item.type == EComponent.SLIDER) { // 滑动块
            let data = item.data;
            component.min = +data.min || 0;
            component.max = +data.max || 100;
            component.value = +value || 0;
        } else if (component instanceof FairyEditor.Component.NumericInput && item.type == EComponent.NUMBERINPUT) { // 数字输入框
            let data = item.data;
            component.min = +data.min || 0;
            component.max = +data.max || 100;
            component.step = +data.step || 0;
            component.value = +value || 0;
        } else if (component instanceof FairyGUI.GButton && item.type == EComponent.SWITCH) { // 切换器
            component.selected = Boolean(value);
        } else if (component instanceof FairyGUI.GButton && item.type == EComponent.RADIOBOX) { // 单选框
            let data = item.data;
            component.GetChildAt(0).text = data.items[0];
            component.GetChildAt(1).text = data.items[1];
            component.selected = Boolean(value);
        }
    }

    private getListItemVal(): string {
        for (let i = 0; i < this.list.numChildren; i++) {
            let item = this.list.GetChildAt(i) as FairyGUI.GComponent;
            let component = item.GetChild("component") as any;
            let value = component.title;
            if (component instanceof FairyEditor.Component.ColorInput) {
                value = FairyEditor.ColorUtil.ToHexString(component.colorValue);
            } else if (component instanceof FairyGUI.GComboBox) {
                value = component.selectedIndex;
            } else if (component instanceof FairyEditor.Component.NumericInput) {
                value = component.value;
            } else if (components[i].type == EComponent.SWITCH) {
                value = (component as FairyGUI.GButton).selected;
            } else if (components[i].type == EComponent.RADIOBOX) {
                value = (component as FairyGUI.GButton).selected ? 1 : 0;
            } else if (components[i].type == EComponent.SLIDER) {
                value = (component as FairyGUI.GSlider).value;
            }

            let key = components[i].key;
            if (this.customDataObj) {
                this.customDataObj[key] = value;
            }

        }
        return JSON.stringify(this.customDataObj) || "";
    }

    private getValueByName(name: string): string {
        // let value = "";
        // if (this.customDataObj?.[name]) {
        //     value = this.customDataObj[name];
        // }
        // return value;
        return this.customDataObj[name];
    }

    private setCustomData() {
        let propName = parent ? "remark" : "customData";
        let data = this.getListItemVal();
        App.activeDoc.inspectingTarget.docElement.SetProperty(propName, data);
    }
}

App.inspectorView.AddInspector(() => new CustomAttributer(), "CustomAttributer", title);
App.docFactory.ConnectInspector("CustomAttributer", "mixed", parent, false);


let isCharacterMatch = (s: string, p: string): boolean => {
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
        if (p[i] != "*") break;
        else dp[s.length][i] = true;
    }

    for (let i = s.length - 1; i >= 0; i--) {
        for (let j = p.length - 1; j >= 0; j--) {
            if (s[i] == p[j] || p[j] == "?") {
                dp[i][j] = dp[i + 1][j + 1];
            } else if (p[j] == "*") {
                dp[i][j] = dp[i + 1][j] || dp[i][j + 1];
            } else {
                dp[i][j] = false;
            }
        }
    }
    return dp[0][0];
};

let isRegMatch = (source: string, pattern: string): boolean => {
    const patt = new RegExp(pattern);
    return patt.test(source);
}

let isMatch = (source: string, pattern: string): boolean => {
    if (pattern.includes("*") || pattern.includes("?")) {
        return isCharacterMatch(source, pattern);
    } else if (pattern.includes("/")) {
        return isRegMatch(source, pattern);
    } else {
        return source.includes(pattern);
    }
}

let getComponent = (componentType: EComponent): FairyGUI.GComponent => {
    let component: FairyGUI.GComponent;
    switch (componentType) {
        case EComponent.TEXTINPUT:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.TEXTINPUT).asCom;
            break;
        case EComponent.TEXTAREA:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.TEXTAREA).asCom;
            break;
        case EComponent.COMBOBOX:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.COMBOBOX).asCom;
            break;
        case EComponent.COLORINPUT:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.COLORINPUT).asCom;
            break;
        case EComponent.NUMBERINPUT:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.NUMBERINPUT).asCom;
            break;
        case EComponent.RESOURCEINPUT:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.RESOURCEINPUT).asCom;
            break;
        case EComponent.SLIDER:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.SLIDER).asCom;
            break;
        case EComponent.RADIOBOX:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.RADIOBOX).asCom;
            break;
        case EComponent.SWITCH:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.SWITCH).asCom;
            break;
        default:
            break;
    }
    return component;
}

