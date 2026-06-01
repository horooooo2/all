<template>
  <div class="help-page">
    <div class="top-wrapper">
      <div class="top-nav">
        <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
        <h1 class="title">{{ $t('帮助中心') }}</h1>
      </div>

      <div class="hero">
        <div class="hero-text">
          <div class="hero-main">{{ $t('你好呀') }}</div>
          <div class="hero-main">{{ $t('欢迎来到帮助中心！') }}</div>
          <div class="hero-sub">{{ $t('期待您的声音。') }}</div>
        </div>
        <img class="hero-image" src="@/assets/img_help_center.png" alt="help-center" />
      </div>
    </div>

    <div class="entry-card">
      <button type="button" class="entry-item" @click="goCommonQuestions">
        <span>{{ $t('常见问题') }}</span>
        <img class="item-arrow" :src="iconArrow" alt="arrow">
      </button>
      <button type="button" class="entry-item" @click="goService">
        <span>{{ $t('在线咨询') }}</span>
        <img class="item-arrow" :src="iconArrow" alt="arrow">
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconArrow from '@/assets/icon_dack_line.svg'

const router = useRouter()
const goBack = () => router.back()
const goCommonQuestions = () => router.push({ name: 'commonQuestions' })
const goService = () => router.push({ name: 'service' })
</script>

<style lang="less" scoped>
@import '@/styles/pages/help-center.less';
</style>
