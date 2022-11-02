"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const App = csharp_1.FairyEditor.App;
let preActive = App.isActive;
let onUpdate = function () {
    var active = App.isActive;
    if (preActive == active) {
        return;
    }
    preActive = active;
    if (active) {
        console.log("检测到从后台返回, 自动刷新资源列表");
        App.RefreshProject();
    }
};
App.add_onUpdate(onUpdate);
const onDestroy = function () {
    App.remove_onUpdate(onUpdate);
};
exports.default = onDestroy;
