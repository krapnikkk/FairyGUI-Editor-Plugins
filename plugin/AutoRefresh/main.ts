import { FairyEditor } from 'csharp';

const App = FairyEditor.App;

let preActive = App.isActive;

let onUpdate = function () {
    var active = App.isActive;
    if (preActive == active) {
        return;
    }

    preActive = active;
    if (active) {
        console.log("检测到从后台返回, 自动刷新资源列表")
        App.RefreshProject();
    }
}

App.add_onUpdate(onUpdate);

const onDestroy = function () {
    App.remove_onUpdate(onUpdate);
}

export default onDestroy;