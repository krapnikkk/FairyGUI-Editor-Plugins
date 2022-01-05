export interface IConfig {
    remote: boolean, // 远程配置地址
    parent: boolean,// 父级组件
    pattern?: string,//匹配符
    mode?: EMode,// 1：设置模式 2：读取模式
    components: IComponent[],
}

export type IComponent = IComboBox | ITextinput | ITextarea | IColorInput;

export interface IBaseComponent {
    id?: string,
    name: string,
    value: number | string,
    defaultVal: number | string,
}

export interface IComboBox extends IBaseComponent {
    type: EComponent.COMBOBOX,
    data: {
        items: string[],
        values: string[]
    }
}

export interface ITextinput extends IBaseComponent {
    type: EComponent.TEXTINPUT,
    data: {}
}

export interface ITextarea extends IBaseComponent {
    type: EComponent.TEXTAREA,
    data: {}
}

export interface IColorInput extends IBaseComponent {
    type: EComponent.COLORINPUT,
}

export enum EComponent {
    TEXTINPUT = "Textinput",
    TEXTAREA = "Textarea",
    COMBOBOX = "ComboBox",
    COLORINPUT = "ColorInput",
    SLIDER = "Slider"
}

export enum EMode {
    WRITE = 1,
    READ = 2
}