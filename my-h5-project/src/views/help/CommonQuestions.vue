<template>
  <div class="questions-page">
    <div class="header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <span class="title">常见问题</span>
    </div>

    <div class="question-list">
      <div class="question-item" v-for="item in questions" :key="item.id">
        <button type="button" class="question-title" @click="toggleQuestion(item.id)">
          <span>{{ item.title }}</span>
          <img
            class="question-arrow"
            :src="expandedIds.includes(item.id) ? iconDetailsTop : iconDetailsDown"
            alt="arrow"
          />
        </button>
        <div v-show="expandedIds.includes(item.id)" class="question-desc">{{ item.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconDetailsDown from '@/assets/icon_details_down2.svg'
import iconDetailsTop from '@/assets/icon_details_top.svg'

const router = useRouter()
const expandedIds = ref([1])

const questions = ref([
  {
    id: 1,
    title: '如果我忘记了密码怎么办?',
    desc: '如果您忘记密码，您可联系客服。申请密码重置，请按照我们发送给您的电子邮件中的说明重置您的密码。'
  },
  {
    id: 2,
    title: '我可以更改我的用户名或注册电子邮件地址吗?',
    desc: '抱歉，我们无法更新信息。如果您坚持更改用户名或注册电子邮件，我们建议您关闭帐户并注册一个新帐户。'
  },
  {
    id: 3,
    title: '如何存款',
    desc: '找到 [我的钱包] 页面，点击进入后，复制钱包地址，或者扫描二维码进行支付，使用钱包提供的任何支持货币。'
  },
  {
    id: 4,
    title: '如何提款',
    desc: '找到 [我的钱包] 页面，打开提现页面，输入您需要提取的钱包地址和币种数量（注意手续费）。'
  },
  {
    id: 5,
    title: '最低提币金额',
    desc: '由于每种货币的价值不同，最低提币金额也不同。'
  },
  {
    id: 6,
    title: '存款和取款需要多长时间?',
    desc: '区块链上的每笔交易都需要几个周期来确认转账。一般来说，每笔交易需要 10 分钟才能被区块链网络确认。'
  },
  {
    id: 7,
    title: '如果我遇到任何问题，我该怎么办?',
    desc: '如果您在我们的游戏时遇到任何问题，请尝试刷新游戏页面。一般情况下就能恢复正常。若问题仍未解决，请随时联系我们。'
  }
])

const goBack = () => router.back()
const toggleQuestion = (id) => {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter(item => item !== id)
    return
  }
  expandedIds.value.push(id)
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/common-questions.less';
</style>

