import path from "node:path";
import { type BuildOptions, type Format, build } from 'esbuild'
import vue from 'unplugin-vue/esbuild'
import {componentsPath, outputComponentsPath} from "./paths.ts";
import GlobalsPlugin from 'esbuild-plugin-globals'
import {emptyDir} from "fs-extra";
import consola from "consola";
import chalk from "chalk";
/**
 * 获取配置打包参数
 * @param format
 */
const getBuildOptions = (format: Format) => {
    const options: BuildOptions = {
        entryPoints: [
            path.resolve(componentsPath, 'index.ts')
        ],
        target: 'es2018',
        platform: 'neutral',
        plugins: [
            vue({
                isProduction: true,
                sourceMap: false,
                template: { compilerOptions: { hoistStatic: false } },
            }),
        ],
        bundle: true,
        format,
        minifySyntax: true,
        outdir: outputComponentsPath,
    }
    if (format === 'iife') {
        options.plugins!.push(
            GlobalsPlugin({
                vue: 'Vue',
            }),
        )
        options.globalName = 'EPIcons'
    } else {
        options.external = ['vue']
    }

    return options
}
const doBuild = async (minify: boolean) => {
    await Promise.all([
        build({
            ...getBuildOptions('esm'),
            entryNames: `[name]${minify ? '.min' : ''}`,
            minify,
        }),
        build({
            ...getBuildOptions('iife'),
            entryNames: `[name].iife${minify ? '.min' : ''}`,
            minify,
        }),
        build({
            ...getBuildOptions('cjs'),
            entryNames: `[name]${minify ? '.min' : ''}`,
            outExtension: { '.js': '.cjs' },
            minify,
        }),
    ])
}
/**
 * 构建组件
 */
const buildComponents= async () =>{
    // 清空dist
    consola.info(chalk.blue('清空打包目录 dist...'))
    await emptyDir(outputComponentsPath)
    consola.info(chalk.blue('开始构建...'))
    return Promise.all([doBuild(true), doBuild(false)])
}
await buildComponents()
consola.info(chalk.blue('构建完成！！！'))
