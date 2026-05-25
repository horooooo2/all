import { ref } from 'vue'
import toast from '@/components/Toast'

/**
 * 修改密码提交：防重复 + loading
 * @param {(payload: import('@/api/profile').PasswordChangeParams) => Promise<unknown>} apiFn
 */
export function usePasswordChange(apiFn) {
    const isSubmitting = ref(false)

    /**
     * @param {import('@/api/profile').PasswordChangeParams} payload
     * @param {{ successMessage?: string, loadingMessage?: string, onSuccess?: () => void | Promise<void> }} [options]
     */
    const submitPasswordChange = async (payload, options = {}) => {
        if (isSubmitting.value) {
            return false
        }

        const {
            successMessage = '修改成功',
            loadingMessage = '提交中...',
            onSuccess
        } = options

        isSubmitting.value = true
        toast.loading(loadingMessage)

        try {
            await apiFn(payload)
            toast.hideLoading()
            toast.success(successMessage)
            if (onSuccess) {
                await onSuccess()
            }
            return true
        } catch (error) {
            toast.hideLoading()
            console.error('修改密码失败:', error)
            return false
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        isSubmitting,
        submitPasswordChange
    }
}
