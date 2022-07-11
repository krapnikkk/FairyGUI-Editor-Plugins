export interface IConfig {
    remote: boolean, // 远程配置地址
    inspectors:IInspector[]
}

export interface IInspector{
    title: string,//inspectorName
    parent: boolean,// 父级组件
    pattern?: string,//匹配符
    mode?: EMode,// 1：设置模式 2：读取模式【暂未实现】
    components: IComponent[],
}

export type IComponent = IComboBox |IRadioBox| INumberInput | ITextinput | ITextarea | IColorInput | ISwitch | IResourceInput | ISlider;

export interface IBaseComponent {
    id?: string,
    name?: string,
    key:string, // 唯一值
    associate?:string //关联组件id
    // value?: number | string // 默认值，该值为空即使用组件默认值
}

export interface IComboBox extends IBaseComponent {
    type: EComponent.COMBOBOX,
    data: {
        items: string[],
        values: string[]
    },
    value:number
    
}

export interface ITextinput extends IBaseComponent {
    type: EComponent.TEXTINPUT,
    value:string
}

export interface ITextarea extends IBaseComponent {
    type: EComponent.TEXTAREA,
    value:string
}

export interface IColorInput extends IBaseComponent {
    type: EComponent.COLORINPUT,
    value:string
}

export interface ISwitch extends IBaseComponent {
    type: EComponent.SWITCH,
    value:boolean
}

export interface IResourceInput extends IBaseComponent {
    type: EComponent.RESOURCEINPUT,
    value:string
}

export interface ISlider extends IBaseComponent {
    type: EComponent.SLIDER,
    data:{
        min:number,
        max:number
    },
    value:number
}

export interface INumberInput extends IBaseComponent {
    type: EComponent.NUMBERINPUT,
    data: {
        min:number,
        max:number,
        step?:number
    },
    value:number
}

export interface IRadioBox extends IBaseComponent {
    type: EComponent.RADIOBOX,
    data: {
        items:string[]
    },
    value:number
}

export enum EComponent {
    TEXTINPUT = "Textinput",
    TEXTAREA = "Textarea",
    COMBOBOX = "ComboBox",
    COLORINPUT = "ColorInput",
    NUMBERINPUT = "NumberInput",
    SLIDER = "Slider",
    RESOURCEINPUT = "ResourceInput",
    RADIOBOX = "RadioBox",
    SWITCH = "Switch",
}

export enum EMode {
    WRITE = 1,
    READ = 2
}