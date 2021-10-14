"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const App = csharp_1.FairyEditor.App;
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/ImageCropper');
let dialog = csharp_1.FairyGUI.UIPackage.CreateObject('ImageCropper', "Main").asCom;
let imageCropperWindow = new csharp_1.FairyGUI.Window();
imageCropperWindow.contentPane = dialog;
imageCropperWindow.Center();
imageCropperWindow.Hide();
let imageSource = dialog.GetChild("imageInput").asLabel;
let rowInput = dialog.GetChild("rowInput").asLabel;
let colInput = dialog.GetChild("colInput").asLabel;
let spanInput = dialog.GetChild("spanInput").asLabel;
let tips = dialog.GetChild("tips").asTextField;
dialog.GetChild("close").onClick.Add(() => {
    tips.text = "";
    imageCropperWindow.Hide();
});
dialog.GetChild("crop").onClick.Add(() => {
    if (rowInput.title == "0" || colInput.title == "0") {
        return;
    }
    let url = imageSource.title;
    if (url) {
        let image = App.project.GetItemByURL(url);
        if (image.type == "image") {
            crop(image);
        }
        else {
            tips.text = "只可以裁剪图片资源！";
        }
    }
    else {
        tips.text = "请选择需要裁剪的图片资源！";
    }
});
const crop = (image) => {
    let { width, height, fileName, parent, path } = image;
    let basePath = App.project.basePath;
    let url = `${basePath}/assets/${parent.name}${path}${fileName}`;
    let col = +colInput.title, row = +rowInput.title;
    let span = +spanInput.title;
    let cropWidth = Math.round(width / row), cropHeight = Math.round(height / col);
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            let x = i == 0 ? cropWidth * i : cropWidth * i - span;
            let y = j == 0 ? cropHeight * j : cropHeight * j - span;
            let w = i == 0 && i == row - 1 ? cropWidth + span * 2 : cropWidth + span;
            let h = j == 0 && j == col - 1 ? cropHeight + span * 2 : cropHeight + span;
            if (w == 0 || h == 0) {
                break;
            }
            let cropper = csharp_1.FairyEditor.VImage.New(url, width, height);
            cropper.Crop(new csharp_1.UnityEngine.Rect(x, y, w, h));
            cropper.Save(`${basePath}/assets/${parent.name}/${fileName.split(".")[0]}_${j}_${i}.png`);
            cropper.Dispose();
        }
    }
    App.RefreshProject();
    tips.text = "裁剪完毕！文件已输出至被裁剪图片资源的同一目录下。";
    // todo 将图片添加进场景中并自动排列
};
let toolMenu = App.menu.GetSubMenu("tool");
toolMenu.AddItem("图片裁剪", "imageCopper", () => {
    imageCropperWindow.Show();
});
