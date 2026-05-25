<template>
  <div v-if="showBar" class="app-download-bar">
    <p class="app-download-bar__text">下载APP，开启您的财富狂潮</p>
    <button type="button" class="app-download-bar__btn" @click="onDownload">
      立即下载
    </button>
    <button type="button" class="app-download-bar__close" aria-label="关闭" @click="onClose">
      <img src="@/assets/icon_x_circle.svg" alt="" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getSiteApp, isSiteAppEnabled } from '@/api/site'
import { openSiteAppDownload } from '@/utils/siteAppDownload'
import {
  getSessionItem,
  setSessionItem,
  migrateLocalToSession
} from '@/utils/sessionCache'

const STORAGE_KEY = 'h5_app_download_bar_dismissed'

const emit = defineEmits(['visible-change'])

migrateLocalToSession(STORAGE_KEY)
const dismissed = ref(getSessionItem(STORAGE_KEY) === '1')
const appReady = ref(false)
const appEnabled = ref(false)
const linkValue = ref('')

const showBar = computed(() => !dismissed.value && appReady.value && appEnabled.value)

const syncVisible = (value) => {
  emit('visible-change', value)
}

watch(showBar, syncVisible, { immediate: true })

onMounted(async () => {
  try {
    const data = await getSiteApp()
    appEnabled.value = isSiteAppEnabled(data.status)
    linkValue.value = data.linkValue?.trim() || ''
  } catch {
    appEnabled.value = false
  } finally {
    appReady.value = true
    syncVisible(showBar.value)
  }
})

const onClose = () => {
  dismissed.value = true
  setSessionItem(STORAGE_KEY, '1')
}

const onDownload = () => {
  openSiteAppDownload()
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

@bar-height: 48px;
@tabbar-height: 50px;

.app-download-bar {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(@tabbar-height + env(safe-area-inset-bottom, 0px));
  z-index: @z-index-tabbar-fixed - 1;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 375px;
  height: @bar-height;
  box-sizing: border-box;
  padding: 0 10px 0 4px;
  background: url('@/assets/bg_down.png') no-repeat center / 100% 100%;

  &__text {
    flex: 1;
    min-width: 0;
    margin: 0;
    padding-left: 52px;
    font-size: @font-size-md;
    font-weight: 500;
    line-height: 1.2;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 2px rgba(0, 51, 153, 0.2);
  }

  &__btn {
    flex-shrink: 0;
    margin-left: 4px;
    padding: 0;
    border: none;
    cursor: pointer;
    width: 80px;
    height: 33px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('@/assets/btn_down.svg') no-repeat center / 100% 100%;
    font-size: @font-size-sm;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 51, 153, 0.35);
  }

  &__close {
    flex-shrink: 0;
    margin-left: 6px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    width: 20px;
    height: 20px;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
