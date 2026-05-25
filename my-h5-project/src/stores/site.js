import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSiteBrand } from '@/api/site'
import { getApiLocalCache, API_CACHE_KEYS } from '@/utils/apiLocalCache'
import logoFallback from '@/assets/logo.svg'

const cachedBrand = getApiLocalCache(API_CACHE_KEYS.SITE_BRAND)

export const useSiteStore = defineStore('site', () => {
    const brand = ref(cachedBrand)

    const logoUrl = computed(() => brand.value?.logoUrl || '')
    const displayLogo = computed(() => logoUrl.value || logoFallback)
    const brandName = computed(() => brand.value?.name || '')
    const slogan = computed(() => brand.value?.slogan || '')

    const fetchBrand = async () => {
        const data = await getSiteBrand()
        brand.value = data
        return data
    }

    /** 已加载则跳过，失败保留本地兜底 */
    const ensureBrand = async () => {
        if (brand.value?.logoUrl || brand.value?.name) {
            return brand.value
        }
        try {
            return await fetchBrand()
        } catch (e) {
            return null
        }
    }

    return {
        brand,
        logoUrl,
        displayLogo,
        brandName,
        slogan,
        fetchBrand,
        ensureBrand
    }
}, {
    persist: true
})
