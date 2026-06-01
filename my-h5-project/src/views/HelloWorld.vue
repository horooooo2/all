<template>
  <div class="hello-world">
    <h1>{{ $t('你好') }}</h1>

    <div class="demo-section">
      <h2>{{ $t('语言切换') }}</h2>
      <LangSwitcher />
    </div>

    <div class="demo-section">
      <h2>{{ $t('主题切换') }}</h2>
      <ThemeSwitcher />
    </div>

    <div class="theme-test card">
      <p class="text-primary">{{ $t('主色文字') }}</p>
      <p class="text-secondary">{{ $t('辅助文字') }}</p>

      <van-button type="primary">{{ $t('主要按钮') }}</van-button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import LangSwitcher from '@/components/LangSwitcher.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
</script>

<style lang="less" scoped>
.hello-world {
  padding: 20px;

  .demo-section {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--card-bg);
  }

  .theme-test {
    margin-top: 20px;

    .text-primary {
      color: var(--primary-color);
    }

    .text-secondary {
      color: var(--text-color-secondary);
    }
  }
}

.card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 15px;
}
</style>
