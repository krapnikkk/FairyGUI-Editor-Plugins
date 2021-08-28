import { FairyEditor, FairyGUI } from 'csharp';

function onPublish(handler: FairyEditor.PublishHandler) {
    let pkg = handler.GetItemDesc(null) as FairyGUI.Utils.XML;
    let id = pkg.GetAttribute("id");
    let match = id.match(/\$\w+/g); // 根据标识符$进行窜改
    if (match) {
        let tag = match[0];
        id = id.replace(tag, "");
        pkg.SetAttribute("id", id);
        handler.ExportBinaryDesc(pkg.ToString());
    }
}

function onDestroy() {
    //do cleanup here
}

export { onPublish, onDestroy };