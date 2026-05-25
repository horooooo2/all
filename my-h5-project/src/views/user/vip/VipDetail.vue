<template>
  <div class="vip-detail-page">
    <header class="vip-detail-nav">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>VIP详情</h1>
    </header>

    <section class="vip-explain-card" aria-label="VIP等级说明">
      <div class="vip-explain-head-row">
        <h2 class="vip-explain-title">VIP等级说明</h2>
        <img class="vip-explain-deco" :src="iconVipxq" alt="" aria-hidden="true">
      </div>
      <p class="vip-explain-text">
        VIP等级设定为1-10级。用户通过在平台充值并满足各层级规定的充值与有效投注要求，即可达到相应的VIP等级并享受该等级的特权。
      </p>
    </section>

    <div class="vip-priv-title vip-detail-section-head">
      <img class="vip-priv-title-side" :src="iconZsLeft" alt="">
      <span class="vip-priv-title-text">VIP升级条件</span>
      <img class="vip-priv-title-side" :src="iconZsRight" alt="">
    </div>

    <div v-if="loading" class="vip-condition-loading">加载中...</div>
    <div v-else class="vip-condition-table-wrap">
      <table class="vip-condition-table">
        <colgroup>
          <col class="col-level">
          <col class="col-up-bet">
          <col class="col-up-recharge">
          <col class="col-down-bet">
          <col class="col-down-recharge">
          <col class="col-bonus">
        </colgroup>
        <thead>
          <tr>
            <th rowspan="2">VIP等级</th>
            <th colspan="2">
              <div class="vip-condition-group-head">
                <span>升级条件</span>
                <span class="vip-condition-group-time">近30天</span>
              </div>
            </th>
            <th colspan="2">
              <div class="vip-condition-group-head">
                <span>保级条件</span>
                <span class="vip-condition-group-time">近30天</span>
              </div>
            </th>
            <th rowspan="2">升级礼金</th>
          </tr>
          <tr>
            <th>
              <div class="vip-condition-subhead">有效投注</div>
            </th>
            <th>
              <div class="vip-condition-subhead">充值</div>
            </th>
            <th>
              <div class="vip-condition-subhead">有效投注</div>
            </th>
            <th>
              <div class="vip-condition-subhead">充值</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in conditionRows" :key="row.id">
            <td class="vip-level-cell">{{ row.levelLabel }}</td>
            <td>{{ row.upBet }}</td>
            <td>{{ row.upRecharge }}</td>
            <td>{{ row.downBet }}</td>
            <td>{{ row.downRecharge }}</td>
            <td>{{ row.bonus }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getVipRules, formatVipThreshold, formatVipMoney } from '@/api/vip'
import iconBack from '@/assets/icon_dack.svg'
import iconVipxq from '@/assets/icon_vipxq.png'
import iconZsLeft from '@/assets/icon_zs_left.svg'
import iconZsRight from '@/assets/icon_zs_right.svg'

const router = useRouter()
const goBack = () => router.back()

const loading = ref(true)
const conditionRows = ref([])

const mapRuleToRow = (rule, maxLevel) => {
  const isMax = rule.levelNo >= maxLevel
  return {
    id: rule.id,
    levelLabel: rule.levelName || `VIP${rule.levelNo}`,
    upBet: isMax && rule.upgradeValidBetAmount <= 0
      ? '已达最高'
      : formatVipThreshold(rule.upgradeValidBetAmount, rule.currencyCode),
    upRecharge: formatVipThreshold(rule.upgradeRechargeAmount, rule.currencyCode),
    downBet: formatVipThreshold(rule.retainValidBetAmount, rule.currencyCode),
    downRecharge: formatVipThreshold(rule.retainRechargeAmount, rule.currencyCode),
    bonus: formatVipMoney(rule.upgradeBonus, rule.currencyCode)
  }
}

const fetchVipRules = async () => {
  loading.value = true
  try {
    const rules = await getVipRules()
    const maxLevel = rules.reduce((max, item) => Math.max(max, item.levelNo), 0)
    conditionRows.value = rules.map((rule) => mapRuleToRow(rule, maxLevel))
  } catch (error) {
    console.error('加载 VIP 规则失败:', error)
    conditionRows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVipRules()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/vip-detail.less';
@import '@/styles/variables.less';

.vip-condition-loading {
  margin: @spacing-md;
  text-align: center;
  font-size: @font-size-sm;
  color: #8f9ab1;
}
</style>
