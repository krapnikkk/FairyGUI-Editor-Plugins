import { FairyGUI, FairyEditor, UnityEngine } from 'csharp';

const App = FairyEditor.App;

App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/CSSAttributer')

class DemoInspector extends FairyEditor.View.PluginInspector {
    private textinput: FairyGUI.GLabel;
    private btn_clear: FairyGUI.GButton;
    private btn_apply: FairyGUI.GButton;
    public constructor() {
        super();

        this.panel = FairyGUI.UIPackage.CreateObject("CSSAttributer", "Main").asCom;
        this.textinput = this.panel.GetChild("textarea").asLabel;
        this.btn_clear = this.panel.GetChild("btn_clear").asButton;
        this.btn_apply = this.panel.GetChild("btn_apply").asButton;
        this.btn_clear.onClick.Add(() => {
            this.textinput.title = "";
        });
        this.btn_apply.onClick.Add(() => {
            let obj = App.activeDoc.inspectingTarget;//obj.objectType类型
            let attributes = this.textinput.title;// "width: 213px;height: 24px;""
            let attributesArr = attributes.split(";");//["width: 213px","height: 24px"]
            attributesArr.forEach(attribute => {// "width: 213px"
                if (attribute !== "") {
                    let attributes = attribute.split(":");
                    let [key, value] = attributes;
                    this.updateAttribute(key, value, obj);
                }
            })
        });

        this.updateAction = () => { return this.updateUI(); };
    }

    private _attributes: string[] = ["background", "color", "border", "border-radius", "font-size", "height", "width", "font-weight"];
    private updateAttribute(key: string, value: string, obj: FairyEditor.FObject) {
        value = value.replace("px", "").replace(/\s/g, "").replace(/\r\n/g, "");
        key = key.replace(/\s/g, "").replace(/\r\n/g, "");
        if (!this._attributes.includes(key)) return;
        let newValue: string | boolean | number | UnityEngine.Color;
        let attrObj: { [key: string]: number | string } = null;
        // todo 根据元件类型更新专属属性
        switch (key) {
            case "color":
            case "background":
                key = "color";
                newValue = FairyEditor.ColorUtil.FromHexString(value);
                break;
            case "border": // border:5px solid red; lineSize[default:1] - lineColor[default:#000000]
                let attrs = value.split(" ");
                let [lineSize, , lineColor] = attrs;
                attrObj = {
                    lineSize, lineColor
                }
                break;
            case "border-radius":
                key = "corner"
                break;
            case "font-size":
                key = "fontSize";
                newValue = +value;
                break;
            case "height":
                key = "height";
                newValue = +value;
                break;
            case "width":
                key = "width";
                newValue = +value;
                break;
            case "font-weight":
                key = "bold";
                newValue = value ? true : false;
                break;
            default:
                break;
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

    private updateUI(): boolean {
        return true; //if everything is ok, return false to hide the inspector
    }
}

//Register a inspector
App.inspectorView.AddInspector(() => new DemoInspector(), "CSSAttributer", "CSSAttributer");
//Condition to show it
App.docFactory.ConnectInspector("CSSAttributer", "mixed", false, false);