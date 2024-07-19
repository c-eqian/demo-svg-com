import { emptyDir, ensureDir } from "fs-extra";
import glob  from "fast-glob";
import { execSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import {componentsPath, svgPath} from "./paths.ts";
import path from "node:path";
import camelcase from "camelcase";
import { type BuiltInParserName, format } from 'prettier'
import consola from "consola";
import chalk from "chalk";
/**
 * 清空指定目录
 */
const emptys = async (path: string)=>{
    await emptyDir(path)
}
/**
 * 确保目标目录存在，否则不存在将会导致报错
 * @param path
 */
const checkEnsureDir = async (path: string)=>{
    await ensureDir(path)
}
/**
 * 获取svg文件
 * @param path
 */
const getSvgFiles = async (path: string)=>{
    return glob('**/*.svg', { cwd: path, absolute: true })
}
/**
 * 根据当前文件过去其文件名称和组件名称
 * @param file
 */
const  getName = (file: string)=> {
    const filename = path.basename(file).replace('.svg', '')
    // 组件名称使用大驼峰形式
    const componentName = camelcase(filename, { pascalCase: true })
    return {
        filename,
        componentName,
    }
}

/**
 * 将vue代码格式化
 * @param code
 * @param parser
 */
const formatCode = (code: string, parser: BuiltInParserName = 'typescript') =>{
    return format(code, {
        parser,
        semi: false,
        singleQuote: true,
    })
}
const codeTransform= async (file: string) =>{
    consola.info(chalk.blue(`读取${file}内容...`))
    // 读取svg内容
    const svgContent = await readFile(file, 'utf8')
    // 根据当前文件过去其文件名称作为组件名称
    const { filename, componentName } = getName(file)
    const vueCode = await formatCode(
        `
            <template>
            ${svgContent}
            </template>
            <script lang="ts" setup>
            defineOptions({
              name: ${JSON.stringify(componentName)}
            })
            </script>`,
        'vue',
    )
    // 确保组件目标路径存在
    await checkEnsureDir(componentsPath)
    const savePath = path.resolve(componentsPath, `${filename}.vue`)
    // vue源码写入指定文件
    await writeFile(
        savePath,
        vueCode,
        'utf-8',
    )
    consola.info(chalk.green(`成功写入${savePath}...`))
}
/**
 * 生成入口文件
 */
const generateEntry = async (files: string[]) =>{
    const code = await formatCode(
        files
            .map((file) => {
                const { filename, componentName } = getName(file)
                return `export { default as ${componentName} } from './${filename}.vue'`
            })
            .join('\n'),
    )
    await writeFile(path.resolve(componentsPath, 'index.ts'), code, 'utf-8')
}
/**
 * svg转换vue
 */
const svgToVueComponent = async () =>{
    await emptys(componentsPath)
    const svgFiles = await getSvgFiles(svgPath)
    consola.info(chalk.blue('生成vue文件...'))
    await Promise.all(svgFiles.map( file => codeTransform(file)))
    consola.info(chalk.blue('生成组件入口文件...'))
    await generateEntry(svgFiles)
    consola.info(chalk.green(`转换已完成！！！`))
}
consola.info(chalk.blue('开始读取svg文件...'))
const svgOptimize = async () => {
    const svgList = await glob('**/*.svg', {cwd: svgPath, absolute: true })
    // 这样处理的原因是，方面扩展svg目录，比如将不同的svg放到不同的目录中
    const getSvgPath = svgList.map((file) => path.dirname(file))
    getSvgPath.forEach((svgPath) => {
        const cmd = `svgo -f ${svgPath} -o ${svgPath}`
        // 执行svgo命令
        execSync(cmd, { stdio: 'inherit' })
        consola.info(chalk.blue(`格式化svg--->${svgPath} 完成！！！`))
    })
}
await svgOptimize()
await svgToVueComponent()
