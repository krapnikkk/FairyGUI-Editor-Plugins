"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDestroy = exports.onPublish = void 0;
function onPublish(handler) {
    let pkg = handler.GetItemDesc(null);
    let id = pkg.GetAttribute("id");
    let match = id.match(/\$\w+/g); // 根据标识符$进行窜改
    if (match) {
        let tag = match[0];
        id = id.replace(tag, "");
        pkg.SetAttribute("id", id);
        handler.ExportBinaryDesc(pkg.ToString());
    }
}
exports.onPublish = onPublish;
function onDestroy() {
    //do cleanup here
}
exports.onDestroy = onDestroy;
