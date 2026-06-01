<template>
  <div class="not-found-page">
    <div class="not-found-inner">
      <div class="illustration-wrap">
        <img class="not-found-img" src="@/assets/img_500.png" alt="" />
      </div>
      <p class="not-found-msg">{{ $t('抱歉,服务器出错') }}</p>
      <button type="button" class="back-home-btn" @click="goHome">{{ $t('返回首页') }}</button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
function goHome() {
  router.replace({ path: '/' })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.not-found-page {
  min-height: 100dvh;
  background: #f0f4fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  box-sizing: border-box;
}

.not-found-inner {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.illustration-wrap {
  margin-bottom: 28px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.not-found-img {
  display: block;
  width: 100%;
  max-width: 180px;
  height: auto;
  object-fit: contain;
  -webkit-user-drag: none;
}

.not-found-msg {
  margin: 0 0 32px;
  font-size: @font-size-md;
  line-height: 1.5;
  color: #8c8c8c;
}

.back-home-btn {
  width: 100%;
  max-width: 240px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: #1890ff;
  color: var(--text-white);
  font-size: @font-size-lg;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.back-home-btn:active {
  opacity: 0.88;
}
</style>
