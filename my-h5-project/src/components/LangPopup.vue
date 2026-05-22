<template>
  <div v-if="show" class="lang-popup-mask" @click="close"></div>
  <transition name="slide-up">
    <div v-if="show" class="lang-popup">
      <div class="popup-header">
        <span class="header-title">{{ $t('语言设置') }}</span>
        <img class="close-btn" src="@/assets/icon_x.svg" alt="关闭" @click="close" />
      </div>
      <div class="lang-list">
        <div
            class="lang-item"
            v-for="lang in languages"
            :key="lang.code"
            :class="{ active: currentLang === lang.code }"
            @click="selectLang(lang.code)"
        >
          <span>{{ lang.name }}</span>
          <img v-if="currentLang === lang.code" src="@/assets/icon_sel.svg" alt="">
          <img v-else src="@/assets/icon_usel.png" alt="">
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLanguageAsync } from '@/i18n'

defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show'])

const { locale } = useI18n()
const currentLang = computed(() => locale.value)

const languages = [
  { code: 'zh', name: '简体中文' },
  { code: 'zht', name: '繁体中文' },
  { code: 'en', name: 'English' },
]

const close = () => {
  emit('update:show', false)
}

const selectLang = async (code) => {
  await loadLanguageAsync(code)
  localStorage.setItem('locale', code)
  setTimeout(close, 300)
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lang-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-mask);
  z-index: @z-index-popup;
}

.lang-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-module);
  border-radius: @border-radius-xl @border-radius-xl 0 0;
  z-index: (@z-index-popup + 1);
  padding: @spacing-md;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @spacing-lg;

  .header-title {
    font-size: @font-size-lg;
    font-weight: 500;
    color: var(--text-color);
  }

  .close-btn {
    width: @icon-x-size;
    height: @icon-x-size;
    cursor: pointer;
    object-fit: contain;
  }
}

.lang-list {
  .lang-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @spacing-md;
    font-size: @font-size-md;
    color: var(--text-color);
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      color: var(--text-color);
      font-weight: 500;
      border-radius: @border-radius-md;
      background: var(--button-selected);
    }

    img {
      width: @icon-sel-size;
      height: @icon-sel-size;
      object-fit: contain;
      flex-shrink: 0;
    }
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
