let fs = require("fs");
export class diffPlugin extends polea.pluginsCommand {
    constructor(private root: string) {
        super()
    }

    async execute() {
        super.execute(arguments);
        this.spinner.info("开始......")
        await this.start(this.root);
        this.spinner.succeed("✅ 完成")
    }

    private start(path: string) {
        return new Promise((resolve) => {
            // 若为true，则会校验所有版本的文件夹，否则只会校验没有runtime.json文件的文件夹
            let checkAllVer: boolean;
            if (path) {
                checkAllVer = false;
            } else {
                checkAllVer = true;
            }


            let root = `release/${path}`
            // 找出所有版本的文件夹
            const dirs = fs.readdirSync(root);
            for (let i = dirs.length - 1; i > -1; i--) {
                const dir = dirs[i];
                if (dir === "web" || dir === "www" || dir == "alpha" || dir == 'beta' || dir == 'publish') {
                    dirs.splice(i, 1);
                    continue;
                }
                if (fs.statSync(root + "/" + dir).isDirectory() === false) {
                    dirs.splice(i, 1);
                }
            }
            console.log("dirs:" + dirs);

            dirs.sort((v1, v2) => {
                return compareVersion(v1, v2);
            })
            console.log("sort:" + dirs);

            // 创建发布目录
            if (checkAllVer == true) {
                removeAll(root + "/www");
            }
            if (fs.existsSync(root + "/www") === false) {
                checkAllVer = true;
                fs.mkdirSync(root + "/www");
            }

            let oldVer = "";

            main();

            async function main() {
                for (const dir of dirs) {
                    console.log("");
                    console.log("make version: " + dir + ", old verion: " + oldVer);
                    const path = root + "/" + dir;
                    makeVersion(dir, path);
                    await sleep(200);
                    oldVer = dir;
                    console.log("set oldVer to " + oldVer);
                }
                resolve(null)
            }

            // 发布指定版本的游戏
            function makeVersion(ver, path) {
                // 检查是否存在runtime.json
                const rumtime_path = path + "/runtime.json";
                if (fs.existsSync(rumtime_path) === true) {
                    if (checkAllVer === true) {
                        fs.rmSync(rumtime_path);
                    }
                    else {
                        console.log("跳过版本：" + ver);
                        return;
                    }
                }

                // 读取版本配置文件
                const oldVerJsonFileName = getVerJson(oldVer);
                const newVerJsonFileName = getVerJson(ver);
                console.log("oldVerJsonFileName: " + oldVerJsonFileName);
                console.log("newVerJsonFileName: " + newVerJsonFileName);

                const oldVerJsonPath = root + "/" + oldVer + "/" + oldVerJsonFileName;
                const newVerJsonPath = root + "/" + ver + "/" + newVerJsonFileName;
                console.log("oldVerJsonPath: " + oldVerJsonPath);
                console.log("newVerJsonPath: " + newVerJsonPath);

                let oldJson: any = {};
                let newJson: any = null;

                try {
                    oldJson = oldVerJsonFileName === null ? {} : JSON.parse(fs.readFileSync(oldVerJsonPath, "utf-8"));
                }
                catch (error) {

                }
                try {
                    newJson = JSON.parse(fs.readFileSync(newVerJsonPath, "utf-8"));
                }
                catch (error) {

                }

                // console.log(newJson);

                // 将目标版本的所有文件的MD5与www中的进行比较，若不一致，则将文件拷贝至WWW中
                for (const key in newJson) {
                    const src = root + "/" + ver + "/" + key;
                    const dst = root + "/www/" + key;

                    // 跳过不存在的文件
                    if (fs.existsSync(src) === false) {
                        continue;
                    }
                    // 跳过文件夹
                    if (fs.statSync(src).isDirectory() === true) {
                        continue;
                    }

                    // 老版本不存在，所有文件都直接拷贝至www
                    if (oldVer === null) {
                        mkDir(dst);
                        // if (fs.existsSync(dst) === true) {
                        //     fs.rmSync(dst);
                        // }
                        console.log("copy src to dst");
                        console.log("src: " + src);
                        console.log("dst: " + dst);
                        fs.copyFileSync(src, dst);
                    }
                    else if (oldJson[key] === newJson[key]) {
                        fs.rmSync(src);
                    }
                    else {
                        mkDir(dst);
                        // if (fs.existsSync(dst) === true) {
                        //     fs.rmSync(dst);
                        // }
                        console.log("oldHash: " + oldJson[key]);
                        console.log("newHash: " + newJson[key]);
                        console.log("copy src to dst");
                        console.log("src: " + src);
                        console.log("dst: " + dst);
                        fs.copyFileSync(src, dst);
                    }
                }
                removeEmptyDirs(path);

                try {
                    fs.copyFileSync(root + "/" + ver + "/version.json", root + "/www/version.json");
                } catch (error) {

                }
                fs.copyFileSync(root + "/" + ver + "/version" + ver + ".json", root + "/www/version" + ver + ".json");

                // 生成runtime.json文件
                const content = `{\r\n\t"scripts": ["${newJson["index.js"]}"],\r\n\t"screenOrientation": "landscape"\r\n}`;
                fs.writeFileSync(path + "/runtime.json", content);

                // 若存在 index.html 文件，则移除
                console.log(path + "/index.httml");
                if (fs.existsSync(path + "/index.html") === true) {
                    fs.rmSync(path + "/index.html");
                }
            }

            // 获取版本信息文件
            function getVerJson(ver) {
                if (ver === null) {
                    return null;
                }
                // 找出version.json文件
                const ver_json_prefix = "version" + ver;
                const dirs = fs.readdirSync(root + "/" + ver);
                let ver_json_file_name = null;
                for (const dir of dirs) {
                    if (dir.indexOf(ver_json_prefix) === 0) {
                        if (ver_json_file_name === null) {
                            ver_json_file_name = dir;
                        }
                        else {
                            throw "存在多个 version.json";
                        }
                    }
                }
                return ver_json_file_name;
            }

            // 递归删除所有空文件夹
            function removeEmptyDirs(path) {
                const dirs = fs.readdirSync(path);

                let length = dirs.length;
                if (length > 0) {
                    for (const dir of dirs) {
                        const subPath = path + "/" + dir;
                        if (fs.statSync(subPath).isDirectory() === true && removeEmptyDirs(subPath) === true) {
                            length--;
                        }
                    }
                }

                if (length === 0) {
                    fs.rmdirSync(path);
                    return true;
                }
                else {
                    return false;
                }
            }

            function mkDir(path) {
                const array = path.split("/");
                array.pop();
                if (array.length === 1) {
                    return;
                }

                let dir = array.shift();
                while (array.length > 0) {
                    dir += "/" + array.shift();
                    if (fs.existsSync(dir) === false) {
                        fs.mkdirSync(dir);
                        // console.log("make dir: " + dir);
                    }
                }
            }

            function removeAll(path) {
                if (fs.existsSync(path) === true) {
                    const files = fs.readdirSync(path);
                    for (const file of files) {
                        const subPath = path + "/" + file;
                        if (fs.statSync(subPath).isDirectory() === true) {
                            removeAll(subPath);
                        }
                        else {
                            console.log("remove:" + subPath);
                            fs.rmSync(subPath);
                        }
                    }
                    fs.rmdirSync(path);
                    console.log("remove:" + path);
                }
            };

            function sleep(msec) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(null);
                    }, msec);
                });
            }

            function compareVersion(v1, v2) {
                const arr1 = v1.split(".");
                const arr2 = v2.split(".");

                const length = Math.max(arr1.length, arr2.length);
                for (let i = 0; i < length; i++) {
                    if (arr1.length < length) {
                        arr1.push(0);
                    }
                    if (arr2.length < length) {
                        arr2.push(0);
                    }

                    const reg0 = +arr1[i];
                    const reg1 = +arr2[i];
                    if (reg0 < reg1) {
                        return -1;
                    }
                    else if (reg1 < reg0) {
                        return 1;
                    }
                }
                return 0;
            }
        })
    }
}