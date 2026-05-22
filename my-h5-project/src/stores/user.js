import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const token = ref('')
    const userInfo = ref(null)
    const isLogin = computed(() => !!token.value)
    const login = (userData) => {
        token.value = userData.token
        userInfo.value = userData
    }
    const logout = () => {
        token.value = ''
        userInfo.value = null
    }
    return { token, userInfo, isLogin, login, logout }
}, {
    persist: true
})
