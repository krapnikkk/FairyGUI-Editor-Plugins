"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMode = exports.EComponent = void 0;
var EComponent;
(function (EComponent) {
    EComponent["TEXTINPUT"] = "Textinput";
    EComponent["TEXTAREA"] = "Textarea";
    EComponent["COMBOBOX"] = "ComboBox";
    EComponent["COLORINPUT"] = "ColorInput";
    EComponent["SLIDER"] = "Slider";
    EComponent["RESOURCEINPUT"] = "ResourceInput";
})(EComponent = exports.EComponent || (exports.EComponent = {}));
var EMode;
(function (EMode) {
    EMode[EMode["WRITE"] = 1] = "WRITE";
    EMode[EMode["READ"] = 2] = "READ";
})(EMode = exports.EMode || (exports.EMode = {}));
