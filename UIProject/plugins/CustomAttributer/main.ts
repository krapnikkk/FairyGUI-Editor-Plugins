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
    console.log("访问线上配置文件");
    // remote
    let url = config.remote || "https://oss.ixald.com/CClient/platform/BigWatermelon/res/jsons/signConfig.json";
    let request = System['Net']['WebRequest'].Create(url);
    request.Method = "GET";
    request.ContentType = "text/html;charset=UTF-8";
    let response = request.GetResponse();
    let responseStream = response.GetResponseStream();
    let streamReader = new System.IO.StreamReader(responseStream);
    let res = streamReader.ReadToEnd();
    try {
        config = JSON.parse(res);
        console.log("获取到线上配置：", config);
    } catch (e) {
        console.warn(e);
    }
}


let { parent, pattern, components, mode,title } = config;

App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/CustomAttributer')

class CustomAttributer extends FairyEditor.View.PluginInspector {
    private list: FairyGUI.GList;
    private components: IComponent[] = [];
    private textMode: FairyGUI.GTextField;
    private mode: EMode;
    private modeCtr: FairyGUI.Controller;

    public constructor() {
        super();

        this.panel = FairyGUI.UIPackage.CreateObject("CustomAttributer", "Main").asCom;
        this.components = components;
        this.list = this.panel.GetChild("list_components").asList;
        this.textMode = this.panel.GetChild("text_mode").asTextField;
        this.mode = mode;
        this.list.numItems = 0;
        this.modeCtr = this.panel.GetController("op");
        this.showList();
        this.updateAction = () => { return this.updateUI(); };
    }

    private showList() {
        if (this.mode == EMode.WRITE) {
            this.textMode.SetVar("mode", "设置").FlushVars();
            this.modeCtr.SetSelectedPage("write");
        } else {
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

            (<FairyGUI.GButton>com).title = name;

            if (!defaultVal) {
                defaultVal = "";
            }
            const component = com.GetChild("component");
            if (component instanceof FairyGUI.GComboBox && item.type == EComponent.COMBOBOX) {
                let { data } = item;
                let { values, items } = data;
                console.log(values, items);
                console.log("GComboBox:", component);
                let valueArr = System.Array.CreateInstance($typeof(System.String), values.length) as System.Array$1<string>;
                for (let i = 0; i < values.length; i++) {
                    let v = values[i];
                    valueArr.set_Item(i, v);
                }

                let itemArr = System.Array.CreateInstance($typeof(System.String), items.length) as System.Array$1<string>;
                for (let i = 0; i < items.length; i++) {
                    let v = items[i];
                    itemArr.set_Item(i, v);
                }

                component.items = itemArr;
                component.values = valueArr;
            } else {
                component.text = defaultVal as string;
            }
            this.list.AddChild(com);
        }
        this.list.ResizeToFit();
    }

    private updateUI(): boolean {
        // 根据匹配规则验证是否显示inspector
        // 正则 & 字符串 通配符
        let name = parent ? App.activeDoc.displayTitle : App.activeDoc.inspectingTarget.name;
        pattern = !pattern ? "*" : pattern;
        return isMatch(name, pattern);
    }

    private setCustomData(data: string) {
        let propName = parent ? "customData" : "remark";
        App.activeDoc.inspectingTarget.SetProperty(propName, data);
    }
}

App.inspectorView.AddInspector(() => new CustomAttributer(), "CustomAttributer", title);
App.docFactory.ConnectInspector("CustomAttributer", "mixed", parent, false);

/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
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
    // 执行
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
        case EComponent.SLIDER:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.SLIDER).asCom;
            break;
        case EComponent.RESOURCEINPUT:
            component = FairyGUI.UIPackage.CreateObject("CustomAttributer", EComponent.RESOURCEINPUT).asCom;
            break;
        default:
            break;
    }
    return component;
}

