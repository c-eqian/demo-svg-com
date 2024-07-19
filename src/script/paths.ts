import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
/**
 * 当前项目的根目录
 * @example project
 */
export const rootPath = resolve(__dirname, '..', '..')
/**
 * src的目录路径
 * @example project/src
 */
export const srcPath = resolve(__dirname, '..')
/**
 * svg 转换vue代码的组件路径
 * @example project/src/components
 */
export const componentsPath = resolve(srcPath, 'components')

/**
 * 打包文件的输出路径
 * @example project/dist
 */
export const outputComponentsPath = resolve(rootPath, 'dist')
/**
 * svg所在的目录路径
 * @example project/src/assets
 */
export const svgPath = resolve(srcPath, 'assets')
