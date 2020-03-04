/*
 * @Author: SiYuan Wang
 * @Date: 2019-11-01 14:19:54
 * @Description: run
 */

const fs = require('fs');
const path = require('path');

const io = require('./helpers/io');
const version = require('./helpers/version');
const download = require('./helpers/download');
const invariant = require('./helpers/invariant');
const install4js = require('./helpers/install');
const handler4packageJson = require('./helpers/handler4package');

const packageJson = require('../package.json');

/**
 * 项目初始化任务运行
 * @method run
 */
function run (name, usingYarn = false, usingCache = false) {
    console.log(`
    *************************************************************************

              _|_|      _|_|_|                _|_|_|  _|        _|_|_|  
            _|    _|  _|                    _|        _|          _|    
            _|_|_|_|    _|_|    _|_|_|_|_|  _|        _|          _|    
            _|    _|        _|              _|        _|          _|    
            _|    _|  _|_|_|                  _|_|_|  _|_|_|_|  _|_|_|

    *************************************************************************`);

    io.print4skipped(`
    Thanks for using as-cli!\n
    Scaffolding based on angular.js@1.5+ and surrounding ecology.
    Designed to simplify the build-up and release process deployment of the development environment.\n
    If you have any questions, please issue: https://github.com/wangsiyuan0215/as-cli.git/issues\n`);

    // 检查当前 node 运行环境
    io.print4title(`Checking node environment and version...`);
    version.checker('node', undefined, 'NodeJs', packageJson.engines.node, 'https://nodejs.org/en/');

    // 检查当前 NPM / YARN 的版本
    if (!usingYarn) {
        io.print4title(`Checking npm environment and version...`);
        version.checker('npm', undefined, 'NPM', packageJson.engines.npm, 'https://docs.npmjs.com/downloading-and-installing-node-js-and-npm');
    } else {
        io.print4title(`Checking yarn environment and version...`);
        version.checker('yarn', undefined, 'YARN', packageJson.engines.yarn, 'https://yarnpkg.com/lang/en/docs/install/#mac-stable');
    }

    // 判断 projectName 是否合法
    invariant(/^[a-zA-Z0-9]*$/.test(name), 'your projectName %s is illegal, please typing correct projectName with number and words...', name);

    // 获取目标目录
    const projectPath = path.resolve(process.cwd(), name);

    // 验证是否存在目录
    io.print4title(`Checking if ${name} folder exists...`);

    const isExisted = fs.existsSync(projectPath);

    if (isExisted) {
        // 验证目标目录是否为空
        const files = fs.readdirSync(projectPath);
        invariant(!files.length, 'folder %s is not empty, please make sure that your project folder is empty.', name);

        io.print4skipped(`  <${name}> folder is existed, but it's empty, will be overrided...`);

    } else {
        io.print4skipped('  No such project or folder, skipped...');
    }

    // 清除已经存在的空文件夹 or 创建目标文件夹
    io.print4title(`${isExisted ? 'Overriding' : 'Creating' } ${name} folder...`);
    isExisted && fs.rmdirSync(projectPath);
    fs.mkdirSync(projectPath);
    io.print4skipped('  path:', projectPath);

    // 下载相应 Git 地址的模板
    const loading = io.print4loading('Downloading scaffold');
    download(packageJson.templateRepo, projectPath, function (duration) {
        loading();
        io.print4skipped(`  🍺 Done in ${duration}s.`);

        // 编辑模板的 package.json 以及相应的其他文件并回写
        handler4packageJson(projectPath, name);

        // 清除 npm cache 并开始安装
        io.print4title(`Preparing to install dependencies by ${usingYarn ? 'yarn' : 'npm'}...`);
        install4js(projectPath, usingYarn, usingCache);

        io.print4title('\nAll dependencies has been installed, Please Enjoy it!');
    });

    // process.exit(0);
}

module.exports = run;
