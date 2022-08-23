export interface IConfig {
    remote: boolean, // 远程配置地址
    list: IItem[]
}

export interface IItem {
    parent: boolean,// 父级组件
    pattern: string[],//匹配符
    content: IContent[]
}

export interface IContent {
    title:string,
    attributes: IAttribute[]
}

export interface IAttribute {
    name: string,
    presets: IPreset[]
}

export interface IPreset {
    key: string,
    value: string
}