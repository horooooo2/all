import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import avatarDefault from '@/assets/touxiang2.png'

/**
 * 个人头像：优先使用 /auth/profile 的 avatar_url（store 中为 avatar）
 */
export function useUserAvatar(fallback = avatarDefault) {
    const userStore = useUserStore()

    const avatarUrl = computed(() => {
        if (!userStore.isLogin) return ''
        return userStore.userInfo?.avatar || ''
    })

    const displayAvatar = computed(() => avatarUrl.value || fallback)

    const refreshProfile = async () => {
        if (!userStore.isLogin) return
        await userStore.fetchProfile()
    }

    return {
        avatarUrl,
        displayAvatar,
        refreshProfile
    }
}
