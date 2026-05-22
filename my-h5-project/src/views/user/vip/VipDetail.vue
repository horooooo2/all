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
        VIP等级设定为1-10级。用户通过在平台充值金币并满足各层级规定的储值要求，即可达到相应的VIP等级并享受该等级的特权。
      </p>
    </section>

    <div class="vip-priv-title vip-detail-section-head">
      <img class="vip-priv-title-side" :src="iconZsLeft" alt="">
      <span class="vip-priv-title-text">VIP升级条件</span>
      <img class="vip-priv-title-side" :src="iconZsRight" alt="">
    </div>

    <div class="vip-condition-table-wrap">
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
                <span>降级条件</span>
                <span class="vip-condition-group-time">近30天</span>
              </div>
            </th>
            <th rowspan="2">等级彩金</th>
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
          <tr v-for="row in conditionRows" :key="row.level">
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
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconVipxq from '@/assets/icon_vipxq.png'
import iconZsLeft from '@/assets/icon_zs_left.svg'
import iconZsRight from '@/assets/icon_zs_right.svg'

const router = useRouter()
const goBack = () => router.back()

/** 占位数据，后续对接配置/接口 */
const conditionRows = [
  { level: 1, levelLabel: 'VIP1', upBet: '—', upRecharge: '≥100', downBet: '—', downRecharge: '—', bonus: '¥18' },
  { level: 2, levelLabel: 'VIP2', upBet: '5,000', upRecharge: '500', downBet: '—', downRecharge: '—', bonus: '¥28' },
  { level: 3, levelLabel: 'VIP3', upBet: '20,000', upRecharge: '2,000', downBet: '2,000', downRecharge: '200', bonus: '¥38' },
  { level: 4, levelLabel: 'VIP4', upBet: '50,000', upRecharge: '5,000', downBet: '8,000', downRecharge: '800', bonus: '¥58' },
  { level: 5, levelLabel: 'VIP5', upBet: '100,000', upRecharge: '10,000', downBet: '30,000', downRecharge: '3,000', bonus: '¥88' },
  { level: 6, levelLabel: 'VIP6', upBet: '300,000', upRecharge: '30,000', downBet: '100,000', downRecharge: '10,000', bonus: '¥128' },
  { level: 7, levelLabel: 'VIP7', upBet: '500,000', upRecharge: '50,000', downBet: '200,000', downRecharge: '20,000', bonus: '¥188' },
  { level: 8, levelLabel: 'VIP8', upBet: '1,000,000', upRecharge: '100,000', downBet: '400,000', downRecharge: '40,000', bonus: '¥288' },
  { level: 9, levelLabel: 'VIP9', upBet: '2,000,000', upRecharge: '200,000', downBet: '800,000', downRecharge: '80,000', bonus: '¥388' },
  { level: 10, levelLabel: 'VIP10', upBet: '已达最高', upRecharge: '—', downBet: '—', downRecharge: '—', bonus: '¥588' }
]
</script>

<style lang="less" scoped>
@import '@/styles/pages/vip-detail.less';
</style>
