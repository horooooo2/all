<template>
  <div
    v-if="visible"
    class="pwd-mismatch-hint"
    role="alert"
  >
    <img :src="iconExclamation" alt="">
    <span>两次密码不一致，请检查</span>
  </div>
</template>

<script setup>
import iconExclamation from '@/assets/icon_exclamation_red.svg'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="less" scoped>
.pwd-mismatch-hint {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  height: 28px;
  padding: 0 12px;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  border-radius: 8px;
  border: 1px solid #EE1818;
  background: #fff;

  img {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    object-fit: contain;
  }

  span {
    font-size: 12px;
    line-height: 1.2;
    color: #EE1818;
  }
}
</style>
