## 元件属性配置预设[PropertyPresetor]

- 编辑器版本：FairyGUI-Editor_2021.3.0
- 根据自定义的元件属性配置表，一键应用到指定的元件属性上。

![入口](../../assets/PropertyPresetor/1.png)
### 支持元件属性
暂时支持[文本(富文本、输入文本)、图形、列表、组件、装载器（3d装载器）、组（高级组）等基本元件的属性配置]，暂不支持基于组件扩展的高级属性配置，例如：进度条、按钮等等。
### 如何配置预配置项
修改本插件同目录下的config.json文件即可
### 表单配置参数参考
```
{
    "remote": "",
    "list": [
        {
            "parent": false,
            "pattern": [
                "text"
            ],
            "content": [
                {
                    "title": "字体配置",

                    "attributes": [
                        {
                            "name": "F101",
                            "presets": [
                                {
                                    "key": "color",
                                    "value": "#fffadc"
                                }
                            ]
                        },
                        {
                            "name": "F102",
                            "presets": [
                                {
                                    "key": "color",
                                    "value": "#ffffff"
                                }
                            ]
                        },
                        {
                            "name": "F201",
                            "presets": [
                                {
                                    "key": "color",
                                    "value": "#ffffff"
                                },
                                {
                                    "key": "shadow",
                                    "value": true
                                },
                                {
                                    "key": "shadowColor",
                                    "value": "#000000"
                                },
                                {
                                    "key": "shadowOffset",
                                    "value": "1,1"
                                }
                            ]
                        },
                        {
                            "name": "F202",
                            "presets": [
                                {
                                    "key": "color",
                                    "value": "#ffffff"
                                },
                                {
                                    "key": "stroke",
                                    "value": true
                                },
                                {
                                    "key": "strokeColor",
                                    "value": "#000000"
                                },
                                {
                                    "key": "strokeSize",
                                    "value": "1"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
```
