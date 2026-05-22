<template>
  <div class="deposit-upload-proof-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>上传凭证</h1>
    </header>

    <main class="proof-main">
      <section class="proof-card">
        <p class="proof-tip">
          <span>1、请您上传这笔存款的完整信息回执单，包含</span>
          <span class="proof-tip__emph">完整的卡号(卡号不能含*)、金额和银行印章</span>
        </p>

        <button type="button" class="proof-example-btn" @click="onShowExample">
          回执单示例
        </button>

        <div class="proof-upload-head">
          <span class="proof-upload-count">{{ fileList.length }}/1</span>
        </div>

        <div class="proof-upload-area">
          <van-uploader
            v-model="fileList"
            accept="image/png,image/jpeg,image/jpg"
            :max-count="1"
            :max-size="MAX_FILE_SIZE"
            :preview-size="64"
            :deletable="true"
            @oversize="onOversize"
            @delete="onDelete"
          >
            <div class="proof-upload-slot" role="button" tabindex="0">
              <img class="proof-upload-slot__img" :src="iconOpinionAdd" alt="上传图片">
            </div>
            <template #preview-delete>
              <img class="proof-upload-del" :src="iconOpinionDel" alt="删除">
            </template>
          </van-uploader>
        </div>

        <p class="proof-format-tip">
          *文件格式为 png、jpg、jpeg，且大小不超过 5MB
        </p>
      </section>
    </main>

    <footer class="proof-footer">
      <button
        type="button"
        class="proof-submit-btn"
        :disabled="!fileList.length"
        @click="onSubmit"
      >
        提交凭证确认付款
      </button>
      <p class="proof-warn">
        <img class="proof-warn__icon" :src="iconExclamationRed" alt="">
        <span class="proof-warn__text">请勿上传虚假交易截图，违者将面临扣盈和封号处罚</span>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconExclamationRed from '@/assets/icon_exclamation_red.svg'
import iconOpinionAdd from '@/assets/icon_opinion_add.svg'
import iconOpinionDel from '@/assets/icon_opinion_del.svg'
import toast from '@/components/Toast'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const route = useRoute()
const router = useRouter()
const fileList = ref([])

const goBack = () => router.back()

const onShowExample = () => {
  toast.success('回执单示例（待对接）')
}

const onOversize = () => {
  toast.warning('图片大小不能超过 5MB')
}

const onDelete = () => {
  fileList.value = []
}

const onSubmit = () => {
  if (!fileList.value.length) {
    toast.warning('请先上传回执单')
    return
  }
  const orderId = route.query.id
  toast.success(`提交凭证确认付款（待对接）${orderId ? ` #${orderId}` : ''}`)
}

</script>

<style lang="less" scoped>
@import '@/styles/pages/deposit-upload-proof.less';
</style>
