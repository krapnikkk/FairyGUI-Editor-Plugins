// v1.0.4
const ideModuleDir = global.ideModuleDir;
const workSpaceDir = global.workSpaceDir;

//引用插件模块
const gulp = require(ideModuleDir + "gulp");
const fs = require("fs");
const path = require("path");
const del = require(ideModuleDir + "del");

let copyLibsTask = ["copyPlatformLibsJsFile"];
let versiontask = ["version2"];
let exec = require('child_process').exec;
let tsconfigPath = path.join(workSpaceDir, "tsconfig.json");
let isTS = fs.existsSync(tsconfigPath);

gulp.task("preCreate_LayaMe", copyLibsTask, function() {
	releaseDir = global.releaseDir;
	config = global.config;
	commandSuffix = global.commandSuffix;
});

gulp.task("del", ["preCreate_LayaMe"], function(cb) {
    let buildFolder = path.join(workSpaceDir, "build");
	if (!isTS || !fs.existsSync(buildFolder)) {
		return cb();
	}
	let delList = [`${buildFolder}/**`];
	del(delList, { force: true }).then(paths => {
		cb();
	}).catch((err) => {
		throw err;
	})
});

gulp.task("tsc", ["del"], function(cb) {
	if (!isTS) {
		return cb();
	}

	let tscPath = path.join(ideModuleDir, ".bin", `tsc${commandSuffix}`);
	return exec(`"${tscPath}" -p "${tsconfigPath}"`, {
		cwd: workSpaceDir,
		shell: true,
		encoding: "utf8"
	}, function(error, stdout, stderr) {
		if (error) console.log("error", error);
		if (stdout) console.log("stdout", stdout);
		if (stderr) console.log("stderr", stderr);
		cb();
	});
});
function getFolderList(rootPath, fileList, fileType, deep= 0) {
    if (!fs.existsSync(rootPath)) {
        return fileList;
    }
    let dirList = fs.readdirSync(rootPath);
    let fileName, fileFullPath;
    for (let i = 0, len = dirList.length; i < len; i++) {
        fileName = dirList[i];
        fileFullPath = path.join(rootPath, fileName);
        if (fs.statSync(fileFullPath).isDirectory()) {
            getFolderList(fileFullPath, fileList, fileType, deep + 1);
        } else {
            if (!!fileType && !fileFullPath.endsWith(fileType)) {
                continue;
            }
            fileList.push({path: fileFullPath,deep:deep});
        }
    }
}

// 将引入的库的路径改为src根目录的LayaMeMain,并且将引入的该类合并到最终发布目录的根目录下的LayaMeMain.js里

gulp.task("mergrToLayaMeMain", ["tsc"], function() {
	let source = "src";
	if (isTS) {
		source = "build";
	}
	let sourceFolder = path.join(workSpaceDir, source);
	// 遍历所有的script，收集引用的类路径
	let usedPathList = [];
	const scriptPath = path.join(sourceFolder, "script");
	let jsList= [];
	let scriptStrList = [];
	let filePath, fileCon, deep; 
	// 遍历所有的uiScript，更改把import script目录下的 改为 LayaMeMain
	const uiScriptPath = path.join(sourceFolder, "uiScript"); 
	jsList= [];
	getFolderList(uiScriptPath, jsList, ".js");
	const actionScriptPath = path.join(sourceFolder, "actionScript", "actionFunc.js"); 
	// console.log('->>>>>>>>>>>>>>>>>>>>>>');
	if (fs.existsSync(actionScriptPath)) {
		jsList.push(
			{
				path: actionScriptPath,
				deep: 0
			}
		);
	}
	for (let i = 0, len = jsList.length; i < len; i++) {
		let pathInfo = jsList[i];
		filePath = pathInfo.path;
		deep = pathInfo.deep + 1;
		fileCon = fs.readFileSync(filePath, "utf8");  
		fileCon = fileCon.replace(/import/mg, "// import"); 
		fs.writeFileSync(filePath, fileCon, "utf8");
	}
	// 遍历所有的script，合并到LayaMeMain.js 
	jsList= [];
	scriptStrList = [];
 
	getFolderList(scriptPath, jsList, ".js");
	for (let i = 0, len = jsList.length; i < len; i++) {
		filePath = jsList[i].path;
		fileCon = fs.readFileSync(filePath, "utf8"); 
		scriptStrList.push(fileCon);
	}           
	let layaMeMainStr = '';  
	const layaMeMainPath = path.join(sourceFolder, "LayaMeMain.js");
	if (fs.existsSync(layaMeMainPath)) { 
		layaMeMainStr = fs.readFileSync(layaMeMainPath, "utf8");
	}
	if (scriptStrList.length > 0) {
		let scriptStrAll = scriptStrList.join('\n');
		layaMeMainStr = scriptStrAll + layaMeMainStr;
	}       	
	if (layaMeMainStr) { 
		console.log(jsList.length,'layaMeMainStr' , layaMeMainStr);
		layaMeMainStr = layaMeMainStr.replace(/import/mg, "// import");
		fs.writeFileSync(`${releaseDir}/LayaMeMain.js`, layaMeMainStr, "utf8");
	} 
});
gulp.task("copy", ["mergrToLayaMeMain"], function() {
	let source = "src";
	if (isTS) {
		source = "build";
	}
	let sourceFolder = path.join(workSpaceDir, source);
	let filters = [
		`${sourceFolder}/{uiScript/**/*.*,actionScript/**/*.*}` 
	];
	if (isTS) { 
		filters.push(
			`${workSpaceDir}/src/{uiScript/**/!(*.ts),actionScript/**/!(*.ts)}`
		); 
	} 
	return gulp.src(filters)
	.pipe(gulp.dest(releaseDir));
});


gulp.task("buildLayaMeProj", versiontask, function() {
	console.log("all tasks completed");
});