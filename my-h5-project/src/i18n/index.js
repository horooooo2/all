import { createI18n } from 'vue-i18n'

const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development'

const messages = {
    zh: () => import('../locales/zh.js'),
    zht: () => import('../locales/zht.js'),
    en: () => import('../locales/en.js')
}

const getInitialLocale = () => {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale) return savedLocale

    const browserLang = navigator.language.toLowerCase()
    if (browserLang.includes('zh')) {
        if (browserLang.includes('tw') || browserLang.includes('hk') || browserLang.includes('mo')) {
            return 'zht'
        }
        return 'zh'
    }
    return 'en'
}

const loadedLanguages = []

const i18n = createI18n({
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'en',
    globalInjection: true,
    messages,

    silentTranslationWarn: isProd,
    silentFallbackWarn: isProd,
    missingWarn: !isProd,
    fallbackWarn: !isProd,
    missing: (locale, key) => {
        if (!isProd) {
            console.warn(`[i18n] 缺少翻译: "${key}" 在 "${locale}" 语言中`)
        }
        return key
    }
})

export function loadLanguageAsync(lang) {
    if (loadedLanguages.includes(lang)) {
        i18n.global.locale.value = lang
        return Promise.resolve()
    }

    return messages[lang]().then(msgs => {
        i18n.global.setLocaleMessage(lang, msgs.default || msgs)
        loadedLanguages.push(lang)
        i18n.global.locale.value = lang
        return Promise.resolve()
    }).catch(err => {
        console.error(`❌ 加载语言包失败 ${lang}:`, err)
        return Promise.reject(err)
    })
}

const initialLocale = getInitialLocale()
loadLanguageAsync(initialLocale)

/** 脚本/模块顶层可用的翻译函数（不依赖 setup 内 useI18n） */
export function t(key, ...args) {
    return i18n.global.t(key, ...args)
}

export default i18n
