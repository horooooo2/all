// postcss.config.js
module.exports = {
    plugins: {
        'postcss-pxtorem': {
            rootValue: 37.5, // 设计稿宽度 / 10 = 375/10 = 37.5
            propList: ['*'], // 所有属性都转换
            selectorBlackList: ['.van-'], // 忽略 Vant 组件（Vant 自带适配）
            minPixelValue: 2, // 小于等于2px不转换
            exclude: /node_modules/i // 排除 node_modules
        }
    }
}
