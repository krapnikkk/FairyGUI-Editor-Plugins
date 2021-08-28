import { FairyEditor } from 'csharp';
import CodeWriter from './CodeWriter';

function genCode(handler: FairyEditor.PublishHandler, isPuerts = true) {
    let settings = (<FairyEditor.GlobalPublishSettings>handler.project.GetSettings("Publish")).codeGeneration;
    let codePkgName = handler.ToFilename(handler.pkg.name); //convert chinese to pinyin, remove special chars etc.
    let exportCodePath = handler.exportCodePath + '/' + codePkgName;
    let namespaceName = codePkgName;
    let ns = "fgui";
    let isThree = handler.project.type == FairyEditor.ProjectType.ThreeJS;
    let isUnity = handler.project.type == FairyEditor.ProjectType.Unity;

    if (isPuerts && isUnity) ns = "FairyGUI";

    if (settings.packageName)
        namespaceName = settings.packageName + '.' + namespaceName;

    //CollectClasses(stripeMemeber, stripeClass, fguiNamespace)
    let classes = handler.CollectClasses(settings.ignoreNoname, settings.ignoreNoname, ns);
    handler.SetupCodeFolder(exportCodePath, "ts"); //check if target folder exists, and delete old files
    let getMemberByName = settings.getMemberByName;

    let classCnt = classes.Count;
    let writer = new CodeWriter({ blockFromNewLine: false, usingTabs: true });
    for (let i: number = 0; i < classCnt; i++) {
        let classInfo = classes.get_Item(i);
        let members = classInfo.members;
        let references = classInfo.references;
        writer.reset();

        if (isPuerts) {
            writer.writeln('/* eslint-disable */');
            writer.writeln();
        }

        let refCount = references.Count;
        if (refCount > 0) {
            for (let j: number = 0; j < refCount; j++) {
                let ref = references.get_Item(j);
                writer.writeln('import %s from "./%s";', ref, ref);
            }
            writer.writeln();
        }

        if (isPuerts && isUnity) {
            writer.writeln('import { FairyGUI } from "csharp";');
            writer.writeln();
        }

        if (isThree) {
            writer.writeln('import * as fgui from "fairygui-three";');
            if (refCount == 0)
                writer.writeln();
        }

        if (classInfo.className == "UI_Main") {
            writer.writeln('import UIBase from "../../core/ui/UIBase";');
            writer.writeln();
            writer.writeln('export default class %s extends %s', classInfo.className, "UIBase");
        } else {
            writer.writeln('export default class %s extends %s', classInfo.className, classInfo.superClassName);
        }
        writer.startBlock();

        let memberCnt = members.Count;
        for (let j: number = 0; j < memberCnt; j++) {
            let memberInfo = members.get_Item(j);
            writer.writeln('public %s: %s;', memberInfo.varName, memberInfo.type);
        }
        writer.writeln('public static URL: string = "ui://%s%s";', handler.pkg.id, classInfo.resId);
        writer.writeln();

        if (isUnity) {
            writer.writeln('public static createInstance<T extends %s>(): T', classInfo.className);
        } else {
            writer.writeln('public static createInstance(): %s', classInfo.className);
        }
        writer.startBlock();

        if (isPuerts && isUnity) {
            writer.writeln(`const obj = <${classInfo.className}>(${ns}.UIPackage.CreateObject("${handler.pkg.name}", "${classInfo.resName}"));`);
            writer.writeln(`return obj as T;`);
        } else {
            writer.writeln('return <%s>(%s.UIPackage.createObject("%s", "%s"));', classInfo.className, ns, handler.pkg.name, classInfo.resName);
        }
        writer.endBlock();
        writer.writeln();

        writer.writeln('protected onConstruct ()');
        writer.startBlock();

        if (isPuerts && isUnity) {
            for (let j: number = 0; j < memberCnt; j++) {
                let memberInfo = members.get_Item(j);
                if (memberInfo.group == 0) {
                    if (getMemberByName) {
                        writer.writeln('this.%s = <%s>(this.GetChild("%s"));', memberInfo.varName, memberInfo.type, memberInfo.name);
                    } else {
                        writer.writeln('this.%s = <%s>(this.GetChildAt(%s));', memberInfo.varName, memberInfo.type, memberInfo.index);
                    }

                    //if (!memberInfo.type.startsWith('FairyGUI.')) {
                    //    writer.writeln(`(this.${memberInfo.varName} as any).onConstruct();`);
                    //}
                }
                else if (memberInfo.group == 1) {
                    if (getMemberByName)
                        writer.writeln('this.%s = this.GetController("%s");', memberInfo.varName, memberInfo.name);
                    else
                        writer.writeln('this.%s = this.GetControllerAt(%s);', memberInfo.varName, memberInfo.index);
                }
                else {
                    if (getMemberByName)
                        writer.writeln('this.%s = this.GetTransition("%s");', memberInfo.varName, memberInfo.name);
                    else
                        writer.writeln('this.%s = this.GetTransitionAt(%s);', memberInfo.varName, memberInfo.index);
                }
            }
        } else {
            for (let j: number = 0; j < memberCnt; j++) {
                let memberInfo = members.get_Item(j);
                if (memberInfo.group == 0) {
                    if (getMemberByName)
                        writer.writeln('this.%s = <%s>(this.getChild("%s"));', memberInfo.varName, memberInfo.type, memberInfo.name);
                    else
                        writer.writeln('this.%s = <%s>(this.getChildAt(%s));', memberInfo.varName, memberInfo.type, memberInfo.index);
                }
                else if (memberInfo.group == 1) {
                    if (getMemberByName)
                        writer.writeln('this.%s = this.getController("%s");', memberInfo.varName, memberInfo.name);
                    else
                        writer.writeln('this.%s = this.getControllerAt(%s);', memberInfo.varName, memberInfo.index);
                }
                else {
                    if (getMemberByName)
                        writer.writeln('this.%s = this.getTransition("%s");', memberInfo.varName, memberInfo.name);
                    else
                        writer.writeln('this.%s = this.getTransitionAt(%s);', memberInfo.varName, memberInfo.index);
                }
            }
        }
        writer.endBlock();

        writer.endBlock(); //class

        writer.save(exportCodePath + '/' + classInfo.className + '.ts');
    }

    writer.reset();

    if (isPuerts) {
        let binderName = codePkgName + 'Binder';

        for (let i: number = 0; i < classCnt; i++) {
            let classInfo = classes.get_Item(i);
            if (classInfo.className == "UI_Main") {
                writer.writeln('import %s from "../%s";', "UI_Main", codePkgName);
            } else {
                writer.writeln('import %s from "./%s";', classInfo.className, classInfo.className);
            }

        }

        if (isThree) {
            writer.writeln('import * as fgui from "fairygui-three";');
            writer.writeln();
        }

        if (isPuerts && isUnity) {
            // writer.writeln('import { FairyGUI } from "csharp";');
            writer.writeln('import { bind } from "./fairygui";');
            // writer.writeln('import { $typeof } from "puerts";');
        }

        writer.writeln();
        writer.writeln('export default class %s', binderName);
        writer.startBlock();

        writer.writeln('public static bindAll():void');
        writer.startBlock();
        for (let i: number = 0; i < classCnt; i++) {
            let classInfo = classes.get_Item(i);
            if (isPuerts && isUnity) {
                writer.writeln('bind(%s);', classInfo.className);
            } else {
                writer.writeln('%s.UIObjectFactory.setExtension(%s.URL, %s);', ns, classInfo.className, classInfo.className);
            }
        }
        writer.endBlock(); //bindall

        writer.endBlock(); //class

        writer.save(exportCodePath + '/' + binderName + '.ts');
        writer.reset();

        if (isUnity) {
            writer.writeln('import { FairyGUI, System } from "csharp";');
            writer.writeln(`
                export function bind(cls: new () => FairyGUI.GComponent) {
                FairyGUI.UIObjectFactory.SetPackageItemExtension((cls as any).URL, () => {
                    const obj = new cls();
                    const tryBind = (actionName: string, funcName: string) => {
                    // 存在则进行绑定
                    if (funcName in obj && typeof obj[funcName] === 'function') {
                        obj[actionName] = new System.Action(obj[funcName].bind(obj));
                    }
                    }
                    tryBind('__onConstruct', 'onConstruct');
                    tryBind('__onDispose', 'onDispose');
                    tryBind('__onInit', 'onInit');
                    tryBind('__onShown', 'onShown');
                    tryBind('__onHide', 'onHide');
                    tryBind('__doShowAnimation', 'doShowAnimation');
                    tryBind('__doHideAnimation', 'doHideAnimation');
                    return obj;
                });
                }
            `)
            writer.save(exportCodePath + '/fairygui.ts')
        }

    }
}

export { genCode };
