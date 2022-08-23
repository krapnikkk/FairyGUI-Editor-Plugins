import { FairyGUI, FairyEditor, System, UnityEngine } from 'csharp';
import { $typeof } from 'puerts';
import { IConfig, IContent } from './index';

const App = FairyEditor.App;

let filePath = `${FairyEditor.App.project.basePath}/plugins/PropertyPresetor/config.json`;
let config: IConfig;
try {
    let sw = new System.IO.StreamReader(filePath);
    let data = sw.ReadToEnd();
    sw.Close();
    // console.log("获取到本地配置:", data);
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


function updateAttribute(key: string, value: string, obj: FairyEditor.FObject) {
    let newValue: string | boolean | number | UnityEngine.Color | UnityEngine.Vector2;
    let attrObj: { [key: string]: number | string } = null;
    if(key.toLocaleLowerCase().indexOf("color")>-1){
        newValue = FairyEditor.ColorUtil.FromHexString(value);
    }else if(key == "shadowOffset"){
        let arr = value.split(",");
        attrObj = {
            shadowX:+arr[0],
            shadowY:+arr[1]
        }
    }else{
        newValue = value;
    }
    if (newValue) {
        obj.docElement.SetProperty(key, newValue);
    }else {
        for (let item in attrObj) {
            obj.docElement.SetProperty(item, attrObj[item]);
        }
    }
}

class ListItem extends FairyGUI.GComponent {
    constructor() {
        super();
    }
    public ConstructFromXML($xml: FairyGUI.Utils.XML): void {
        super.ConstructFromXML($xml);
    }
    Setup_BeforeAdd($buffer: FairyGUI.Utils.ByteBuffer, $beginPos: number) {
        super.Setup_BeforeAdd($buffer, $beginPos);
    }

    init(content: IContent) {
        let { title, attributes } = content
        this.GetChild("title").text = title;

        let valueArr = System.Array.CreateInstance($typeof(System.String), attributes.length) as System.Array$1<string>;
        let itemArr = System.Array.CreateInstance($typeof(System.String), attributes.length) as System.Array$1<string>;
        for (let i = 0; i < attributes.length; i++) {
            let v = attributes[i].name;
            valueArr.set_Item(i, v);
            itemArr.set_Item(i, v);
        }

        let component = this.GetChild("component") as FairyGUI.GComboBox;
        component.items = itemArr;
        component.values = valueArr;
        component.value = attributes[0].name;

        (this.GetChild("btn_apply") as FairyGUI.GButton).onClick.Add(() => {
            let curVal = component.value;
            attributes.forEach(attribute => {
                let { presets, name } = attribute;
                if (name == curVal) {
                    presets.forEach((preset) => {
                        let { key, value } = preset;
                        let obj = App.activeDoc.inspectingTarget;
                        updateAttribute(key, value,obj)
                    })
                }
            })
        })
    }
}


class PropertyPresetor extends FairyEditor.View.PluginInspector {
    private list: FairyGUI.GList;
    private content: IContent[];
    private pattern: string[];
    public constructor(content: IContent[], pattern: string[]) {
        super();
        this.content = content;
        this.pattern = pattern;
        this.panel = FairyGUI.UIPackage.CreateObject("PropertyPresetor", "Main") as FairyGUI.GComponent;
        this.list = this.panel.GetChild("list") as FairyGUI.GList;
        this.list.itemRenderer = this.itemRenderer.bind(this);
        this.list.numItems = content.length;
        this.list.ResizeToFit();

        this.updateAction = () => { return this.updateUI(); };
    }

    itemRenderer(idx: number, item: ListItem) {
        let data = this.content[idx];
        item.init(data)
    }

    private updateUI(): boolean {
        let visivle = this.pattern.some((val) => {
            let obj = App.activeDoc.inspectingTarget;
            let type = obj.GetType().ToString().toLowerCase();
            return type.indexOf(val) > -1;
        })
        return visivle;
    }

}

FairyGUI.UIObjectFactory.SetPackageItemExtension("ui://PropertyPresetor/item", () => new ListItem);
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/PropertyPresetor')
for (let i = 0; i < config.list.length; i++) {
    let item = config.list[i];
    let { parent, content, pattern } = item;
    App.inspectorView.AddInspector(() => new PropertyPresetor(content, pattern), "元件属性配置预设", "元件属性配置预设");
    App.docFactory.ConnectInspector("元件属性配置预设", "mixed", parent, false);
}

