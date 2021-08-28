var polea = (() => {
  // src/GameConfig.ts
  var GameConfig = class {
    constructor() {
    }
    static init() {
      var reg = Laya.ClassUtils.regClass;
    }
  };
  GameConfig.width = 750;
  GameConfig.height = 1334;
  GameConfig.scaleMode = "fixedwidth";
  GameConfig.screenMode = "none";
  GameConfig.alignV = "top";
  GameConfig.alignH = "left";
  GameConfig.startScene = "";
  GameConfig.sceneRoot = "";
  GameConfig.debug = false;
  GameConfig.stat = false;
  GameConfig.physicsDebug = false;
  GameConfig.exportSceneToJson = true;
  GameConfig.init();

  // src/App.ts
  var App = class {
    constructor() {
      this.currentTheme = "yellow";
      this.initConfig();
    }
    initConfig() {
      Laya.URL.basePath = "./res/fgui/";
      Laya.stage.addChild(fgui.GRoot.inst.displayObject);
      let theme = Laya.Utils.getQueryString("theme");
      if (theme) {
        console.log("\u5F53\u524D\u4E3B\u9898\uFF1A", theme);
        this.currentTheme = theme;
      }
      this.loadRes();
    }
    loadRes() {
      Laya.loader.load([
        { url: "Pet.fui", type: Laya.Loader.BUFFER },
        { url: `${this.currentTheme}/Asset.fui`, type: Laya.Loader.BUFFER },
        { url: `${this.currentTheme}/Asset_atlas0.png`, type: Laya.Loader.IMAGE }
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
  };

  // src/Main.ts
  var Main = class {
    constructor() {
      if (window["Laya3D"])
        Laya3D.init(GameConfig.width, GameConfig.height);
      else
        Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
      Laya["Physics"] && Laya["Physics"].enable();
      Laya["DebugPanel"] && Laya["DebugPanel"].enable();
      Laya.stage.scaleMode = GameConfig.scaleMode;
      Laya.stage.screenMode = GameConfig.screenMode;
      Laya.stage.alignV = GameConfig.alignV;
      Laya.stage.alignH = GameConfig.alignH;
      Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
      if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
        Laya.enableDebugPanel();
      if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
        Laya["PhysicsDebugDraw"].enable();
      if (GameConfig.stat)
        Laya.Stat.show();
      Laya.alertGlobalError(true);
      Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    }
    onVersionLoaded() {
      Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    }
    onConfigLoaded() {
      new App();
    }
  };
  new Main();
})();
//# sourceMappingURL=bundle.js.map
