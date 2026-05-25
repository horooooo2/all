import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import toast from '@/components/Toast'

/**
 * 个人资料子页保存：防重复提交 + 调 /profile/update + 刷新 store
 */
export function useProfileSave() {
    const userStore = useUserStore()
    const isSubmitting = ref(false)

    /**
     * @param {import('@/api/profile').ProfileUpdateParams} partial
     * @param {{ successMessage?: string, loadingMessage?: string }} [options]
     */
    const saveProfile = async (partial, options = {}) => {
        if (isSubmitting.value) {
            return false
        }

        const { successMessage = '设置成功', loadingMessage = '提交中...' } = options

        isSubmitting.value = true
        toast.loading(loadingMessage)

        try {
            await userStore.patchProfile(partial)
            toast.hideLoading()
            toast.success(successMessage)
            return true
        } catch (error) {
            toast.hideLoading()
            console.error('更新个人资料失败:', error)
            return false
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        isSubmitting,
        saveProfile
    }
}
