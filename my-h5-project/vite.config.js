import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import path from 'path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'))

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version)
    },
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia', {
                '@/stores/user': ['useUserStore']
            }],
            dts: 'src/auto-imports.d.ts',
            eslintrc: { enabled: true },
        }),
        Components({
            resolvers: [VantResolver()],
            dts: 'src/components.d.ts',
        }),
    ],
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
        host: true,
        port: 5173,
    },
    css: {
        postcss: {
            plugins: [(await import('postcss-pxtorem')).default({
                rootValue: 37.5,
                propList: ['*'],
                selectorBlackList: ['.van-'],
                minPixelValue: 2
            })]
        },
        preprocessorOptions: {
            less: { javascriptEnabled: true }
        }
    },
    // 🚀 新增：打包优化配置
    build: {
        rollupOptions: {
            output: {
                // 手动分包
                manualChunks(id) {
                    if (!id.includes('node_modules')) return
                    if (id.includes('node_modules/vant')) return 'vendor-vant'
                    if (
                        /node_modules\/vue\//.test(id) ||
                        /node_modules\/vue-router/.test(id) ||
                        /node_modules\/pinia/.test(id) ||
                        /node_modules\/@vue\//.test(id)
                    ) {
                        return 'vendor-vue'
                    }
                    return 'vendor-other'
                }
            }
        },
        // 开启代码压缩
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,  // 移除console
                drop_debugger: true  // 移除debugger
            }
        },
        // 生成sourcemap（生产环境可以关闭）
        sourcemap: false,
        // 小于10K的图片转base64
        assetsInlineLimit: 10240
    }
})
