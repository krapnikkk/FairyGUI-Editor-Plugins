export default class App {
    constructor() {
        this.initConfig();
    }

    currentTheme: string = "yellow";
    initConfig() {
        Laya.URL.basePath = "./res/fgui/"
        Laya.stage.addChild(fgui.GRoot.inst.displayObject);
        let theme: string = Laya.Utils.getQueryString("theme");
        if (theme) {
            console.log("当前主题：", theme);
            this.currentTheme = theme;
        }
        this.loadRes();
    }


    loadRes() {
        Laya.loader.load([
            { url: "Pet.fui", type: Laya.Loader.BUFFER },
            { url: `${this.currentTheme}/Asset.fui`, type: Laya.Loader.BUFFER },
            { url: `${this.currentTheme}/Asset_atlas0.png`, type: Laya.Loader.IMAGE },
        ], Laya.Handler.create(this, this.init));
    }


    init() {
        fgui.UIPackage.addPackage(`${this.currentTheme}/Asset`);
        fgui.UIPackage.addPackage("Pet");
        let view = fgui.UIPackage.createObject("Pet", "Main").asCom;
        fgui.GRoot.inst.addChild(view);
        view.getChild("btn_change").onClick(this, this.change);
    }

    change() {
        this.currentTheme = this.currentTheme == "yellow" ? "blue" : "yellow";
        location.href = `index.html?theme=${this.currentTheme}`;
    }

}
