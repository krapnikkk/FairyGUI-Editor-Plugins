/// <reference types="./node" />
declare module polea {
    export class run {
        constructor();
        private static _runPlugin;
        static get Plugin(): string;
        static set Plugin(value: string);
    }
}
declare module polea {
    /**
     * 统计运行时间长度
     * @param start 开始的时间戳（bigint）
     * @returns
     */
    export function getNanoSecTime(start: bigint): string;
    export function exec(cmd: string, success: Function, fail?: Function): void;
}
declare module polea {
    /**
     * 编译成虚拟文件在虚拟环境中执行代码
     * @param projectPath 项目路径
     * @param platform 平台
     * @returns
     */
    export function buildConfigVM(projectPath: string, platform?: string): Promise<ConfigManager>;
    export function out_config(projectPath: string, platform?: string): string;
    export function buildConfigEx(projectPath: string, platform?: string): Promise<ConfigManager>;
}
declare module polea {
    /** 编译ts代码 */
    export class ESBundlePlugin extends pluginsCommand {
        name: string;
        private config;
        constructor(config?: buildConfig);
        execute(): Promise<void>;
        runWatch(): Promise<void>;
    }
}
declare module polea {
    export type Matcher = {
        /**
         * 匹配规则可以是数组 (`./bin/**`匹配。./bin/目录下的所有文件)
         */
        from: string | string[];
        /**
         * 目标位置
         * default /release/polea/[path][name]_[hash].[ext]
         */
        to: string;
        /**
         * 初始位置，默认是匹配规则的初始位置
         * default "./"
         */
        base: string;
    };
    export class CopyPlugin extends pluginsCommand {
        private hash;
        private matchers;
        private clean;
        name: string;
        /**
         *
         * @param hash "crc32" | "md5" 拷贝重命名方式
         * @param matchers 匹配文件路径规则
         * @param clean 拷贝后是否删除
         */
        constructor(hash: "crc32" | "md5", matchers: Matcher[], clean?: boolean);
        execute(): Promise<void>;
        private runPattern;
    }
}
declare module polea {
    export module FileUtile {
        /**
         * 保存数据到指定文件
         * @param path 文件完整路径名
         * @param data 要保存的数据
         */
        function save(path: string, data: any): void;
        function writeFileAsync(path: string, content: string, charset: string): Promise<boolean>;
        /**
         * 创建文件夹
         */
        function createDirectory(path: string, mode?: any): void;
        /**
         * 读取文本文件,返回打开文本的字符串内容，若失败，返回"".
         * @param path 要打开的文件路径
         */
        function read(path: string, ignoreCache?: boolean): string;
        function readFileAsync(path: string, charset: string): Promise<string>;
        /**
         * 读取字节流文件,返回字节流，若失败，返回null.
         * @param path 要打开的文件路径
         */
        function readBinary(path: string): any;
        /**
         * 复制文件或目录
         * @param source 文件源路径
         * @param dest 文件要复制到的目标路径
         */
        function copy(source: string, dest: string): void;
        function isDirectory(path: string): boolean;
        function isSymbolicLink(path: string): boolean;
        function isFile(path: string): boolean;
        /**
         * 删除文件或目录
         * @param path 要删除的文件源路径
         */
        function remove(path: string): void;
        /**
         * 递归删除所有空文件夹
         * @param path 要删除的文件源路径
         * @returns
         */
        function removeEmptyDirs(path: string): boolean;
        function rename(oldPath: string, newPath: string): void;
        /**
         * 返回指定文件的父级文件夹路径,返回字符串的结尾已包含分隔符。
         */
        function getDirectory(path: string): string;
        /**
         * 获得路径的扩展名,不包含点字符。
         */
        function getExtension(path: string): string;
        /**
         * 获取路径的文件名(不含扩展名)或文件夹名
         */
        function getFileName(path: string): string;
        /**
         * 获取指定文件夹下的文件或文件夹列表，不包含子文件夹内的文件。
         * @param path 要搜索的文件夹
         * @param relative 是否返回相对路径，若不传入或传入false，都返回绝对路径。
         */
        function getDirectoryListing(path: string, relative?: boolean): string[];
        /**
         * 获取指定文件夹下全部的文件列表，包括子文件夹
         * @param path
         * @returns {any}
         */
        function getDirectoryAllListing(path: string): string[];
        /**
         * 使用指定扩展名搜索文件夹及其子文件夹下所有的文件
         * @param dir 要搜索的文件夹
         * @param extension 要搜索的文件扩展名,不包含点字符，例如："png"。不设置表示获取所有类型文件。
         */
        function search(dir: string, extension?: string): string[];
        /**
         * 使用过滤函数搜索文件夹及其子文件夹下所有的文件
         * @param dir 要搜索的文件夹
         * @param filterFunc 过滤函数：filterFunc(file:File):Boolean,参数为遍历过程中的每一个文件，返回true则加入结果列表
         */
        function searchByFunction(dir: string, filterFunc: Function, checkDir?: boolean): string[];
        /**
         * 指定路径的文件或文件夹是否存在
         */
        function exists(path: string): boolean;
        /**
         * 转换本机路径为Unix风格路径。
         */
        function escapePath(path: string): string;
        /**
         * 连接路径,支持传入多于两个的参数。也支持"../"相对路径解析。返回的分隔符为Unix风格。
         */
        function joinPath(dir: string, ...filename: string[]): string;
        function getRelativePath(dir: string, filename: string): string;
        function basename(p: string, ext?: string): string;
        function relative(from: string, to: string): string;
        function searchPath(searchPaths: string[]): string | null;
        function moveAsync(oldPath: string, newPath: string): Promise<void>;
        function existsSync(path: string): boolean;
        function existsAsync(path: string): Promise<boolean>;
        function copyAsync(src: string, dest: string): Promise<void>;
        function removeAsync(dir: string): Promise<void>;
        function readFileSync(filename: string): string;
        function readJSONSync(file: string): any;
        function statSync(path: string): any;
        function writeJSONAsync(file: string, object: any): Promise<void>;
    }
}
declare module polea {
    export class ManifestPlugin extends pluginsCommand {
        private hash;
        private matchers;
        private file;
        name: string;
        private manifest;
        /**
         *
         * @param hash "crc32" | "md5" 拷贝重命名方式
         * @param matchers 匹配文件路径规则
         * @param clean 拷贝后是否删除
         */
        constructor(hash: "crc32" | "md5", matchers: Matcher[], file: string);
        execute(): Promise<void>;
        private runPattern;
    }
}
declare module polea {
    export class UIPlugin extends pluginsCommand {
        private clear;
        private mode;
        private code;
        private atlas;
        name: string;
        private manifest;
        constructor(clear?: boolean, mode?: string, code?: boolean, atlas?: boolean);
        execute(): Promise<void>;
        runWatch(): Promise<void>;
    }
}
declare module polea {
    export type LayadccOption = {
        srcpath: string;
        cache?: boolean;
        url?: string;
        lwr?: boolean;
        escspace?: boolean;
        outpath?: string;
        cout?: string;
    };
    export class LayadccPlugin extends pluginsCommand {
        private options;
        name: string;
        /**
         *
         * @param hash "crc32" | "md5" 拷贝重命名方式
         * @param matchers 匹配文件路径规则
         * @param clean 拷贝后是否删除
         */
        constructor(options: LayadccOption);
        execute(): Promise<void>;
    }
}
declare module polea {
    export function getLocalIp(): any;
}
declare module polea {
    export interface Plugin {
        name: string;
        setup: (build: PluginBuild) => void | Promise<void>;
    }
    export interface PluginBuild {
        initialOptions: any;
        onStart(callback: () => any): void;
        onEnd(callback: (result: any) => void | Promise<void>): void;
        onResolve(options: any, callback: (args: any) => any): void;
        onLoad(options: any, callback: (args: any) => any): void;
    }
    type Color = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray';
    type SpinnerName = 'dots' | 'dots2' | 'dots3' | 'dots4' | 'dots5' | 'dots6' | 'dots7' | 'dots8' | 'dots9' | 'dots10' | 'dots11' | 'dots12' | 'dots8Bit' | 'line' | 'line2' | 'pipe' | 'simpleDots' | 'simpleDotsScrolling' | 'star' | 'star2' | 'flip' | 'hamburger' | 'growVertical' | 'growHorizontal' | 'balloon' | 'balloon2' | 'noise' | 'bounce' | 'boxBounce' | 'boxBounce2' | 'triangle' | 'arc' | 'circle' | 'squareCorners' | 'circleQuarters' | 'circleHalves' | 'squish' | 'toggle' | 'toggle2' | 'toggle3' | 'toggle4' | 'toggle5' | 'toggle6' | 'toggle7' | 'toggle8' | 'toggle9' | 'toggle10' | 'toggle11' | 'toggle12' | 'toggle13' | 'arrow' | 'arrow2' | 'arrow3' | 'bouncingBar' | 'bouncingBall' | 'smiley' | 'monkey' | 'hearts' | 'clock' | 'earth' | 'material' | 'moon' | 'runner' | 'pong' | 'shark' | 'dqpb' | 'weather' | 'christmas' | 'grenade' | 'point' | 'layer' | 'betaWave';
    type PrefixTextGenerator = () => string;
    export interface Ora {
        /**
        A boolean of whether the instance is currently spinning.
        */
        readonly isSpinning: boolean;
        /**
        Change the text after the spinner.
        */
        text: string;
        /**
        Change the text or function that returns text before the spinner. No prefix text will be displayed if set to an empty string.
        */
        prefixText: string | PrefixTextGenerator;
        /**
        Change the spinner color.
        */
        color: Color;
        /**
        Change the spinner.
        */
        spinner: SpinnerName;
        /**
        Change the spinner indent.
        */
        indent: number;
        /**
        Start the spinner.
    
        @param text - Set the current text.
        @returns The spinner instance.
        */
        start(text?: string): Ora;
        /**
        Stop and clear the spinner.
    
        @returns The spinner instance.
        */
        stop(): Ora;
        /**
        Stop the spinner, change it to a green `✔` and persist the current text, or `text` if provided.
    
        @param text - Will persist text if provided.
        @returns The spinner instance.
        */
        succeed(text?: string): Ora;
        /**
        Stop the spinner, change it to a red `✖` and persist the current text, or `text` if provided.
    
        @param text - Will persist text if provided.
        @returns The spinner instance.
        */
        fail(text?: string): Ora;
        /**
        Stop the spinner, change it to a yellow `⚠` and persist the current text, or `text` if provided.
    
        @param text - Will persist text if provided.
        @returns The spinner instance.
        */
        warn(text?: string): Ora;
        /**
        Stop the spinner, change it to a blue `ℹ` and persist the current text, or `text` if provided.
    
        @param text - Will persist text if provided.
        @returns The spinner instance.
        */
        info(text?: string): Ora;
        /**
        Clear the spinner.
    
        @returns The spinner instance.
        */
        clear(): Ora;
        /**
        Manually render a new frame.
    
        @returns The spinner instance.
        */
        render(): Ora;
        /**
        Get a new frame.
    
        @returns The spinner instance text.
        */
        frame(): string;
    }
    /**
     * 构建管线命令
     */
    export abstract class pluginsCommand {
        /** 插件名称 */
        name: string;
        spinner: Ora;
        protected stime: bigint;
        /** 平台 */
        platform: string;
        command: "compile" | "publish";
        output: string;
        /** 是否监听文件变化 */
        watch: boolean;
        /** 项目路径 */
        workspace: string;
        constructor();
        /**
         * 开始运行管线命令
         * */
        execute(arg?: any): Promise<any>;
        runWatch(): Promise<void>;
        UserConfig: UserConfig;
    }
    export interface DevServer {
        /** 端口 */
        port?: number;
        /** 自动打开浏览器 */
        open?: boolean;
        /** 服务根目录 */
        servedir?: string;
    }
    export interface UserConfig {
        output: string;
        plugins?: pluginsCommand[];
        entry?: string[];
        define?: Record<string, any>;
        outfile?: string;
        outputDir?: string;
        server?: false | DevServer;
        /** 是否监听文件变化 */
        watch?: boolean;
        /** 压缩时移除的代码 默认值:[] */
        pure?: Array<any>;
        /** 是否压缩代码 */
        minify?: boolean;
        /** 是否有资源map，默认值:true */
        sourcemap?: boolean;
        /** 是否写入文件  默认值:true*/
        write?: boolean;
        /** 全局名称 默认值:polec */
        globalName?: string;
    }
    export interface buildConfig {
        /** 入口 ['./src/Main.ts'] */
        entry?: Array<string>;
        /** 常量 */
        define?: Record<string, any>;
        /** 输出的文件 */
        outfile?: string;
        server?: false | DevServer;
        /** 是否监听文件变化 */
        watch?: boolean;
        /** 压缩时移除的代码 默认值:[] */
        pure?: Array<any>;
        /** 是否压缩代码 */
        minify?: boolean;
        /** 是否有资源map，默认值:true */
        sourcemap?: boolean;
        /** 是否写入文件  默认值:true*/
        write?: boolean;
        /** 全局名称 默认值:polec */
        globalName?: string;
        /** 插件 */
        plugins?: Plugin[];
    }
    /**
     * ConfigManager 配置文件
     */
    export type ConfigManager = {
        /**
         * 构建与发布配置
         */
        buildConfig: (param: ConfigCommand) => UserConfig;
    };
    export interface ConfigCommand {
        command: "compile" | "publish";
    }
}
declare module polea {
    export class CleanPlugin extends pluginsCommand {
        private patterns;
        private force;
        name: string;
        /**
         * 请使用当前目录的相对路径
         * @param patterns 匹配文件路径
         * @param force 是否允许删除当前工作目录之外部目录。
         */
        constructor(patterns: string | readonly string[], force?: boolean);
        execute(): Promise<void>;
    }
}
declare module polea {
    export class CompressJSPlugin extends pluginsCommand {
        private hash;
        private matchers;
        private clean;
        constructor(hash: "crc32" | "md5", matchers: Matcher[], clean?: boolean);
        execute(): Promise<void>;
        private runPattern;
    }
}
declare module polea {
    export class ProcessPlugin extends pluginsCommand {
        private shell;
        name: string;
        private manifest;
        /**
         *
         * @param hash "crc32" | "md5" 拷贝重命名方式
         * @param matchers 匹配文件路径规则
         * @param clean 拷贝后是否删除
         */
        constructor(shell: string);
        execute(): Promise<void>;
    }
}
