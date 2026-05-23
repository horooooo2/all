<template>
  <div class="game-room-page">
    <GameNavBar
      :title="currentGameTitle"
      :room-text="currentRoomText"
      :time-text="headerTimeText"
      :issue-no="headerIssueNo"
      :status-text="headerStatusText"
      :online-count="8211"
      :dropdown-open="gameListOpen"
      @back="goBack"
      @toggleGameList="onToggleGameList"
      @menu="onMenu"
    />

    <teleport to="body">
      <transition name="next-result-popup-fade">
        <div
          v-if="nextResultPopupOpen"
          class="next-result-popup-mask"
          role="dialog"
          aria-modal="true"
          @click.self="closeNextResultPopup"
        >
          <div class="next-result-popup-panel" :style="{ top: nextResultPopupTopCss }" @click.stop>
            <div class="next-result-popup-panel__body">
              <div class="trend-table">
                <div class="trend-row trend-row--head">
                  <div class="col col-issue">期号</div>
                  <div class="col col-nums">开奖号码</div>
                  <div class="col col-sum">总和双面</div>
                  <div class="col col-ext1">极值</div>
                  <div class="col col-ext2">极值</div>
                  <div class="col col-tail">尾</div>
                </div>

                <div v-for="row in trendRows" :key="row.issue" class="trend-row">
                  <div class="col col-issue">{{ row.issue }}</div>

                  <div class="col col-nums">
                    <span class="ball red">{{ row.nums[0] }}</span>
                    <span class="ball blue">{{ row.nums[1] }}</span>
                    <span class="ball red">{{ row.nums[2] }}</span>
                  </div>

                  <div class="col col-sum">
                    <span class="tag" :class="row.bigSmall === '大' ? 'tag-red' : 'tag-blue'">{{ row.bigSmall }}</span>
                    <span class="tag tag-blue">{{ row.oddEven }}</span>
                  </div>

                  <div class="col col-ext1">
                    <span class="tag tag-blue">{{ row.extreme1 || '—' }}</span>
                  </div>

                  <div class="col col-ext2">
                    <span class="tag tag-red">{{ row.extreme2 || '—' }}</span>
                  </div>

                  <div class="col col-tail">
                    <span class="tail">尾{{ row.tail }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="next-result-popup-panel__footer">
              <button type="button" class="btn btn-ghost" @click="closeNextResultPopup">返回</button>
              <button type="button" class="btn btn-primary" @click="onViewFullTrend">查看完整走势</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="game-switch-fade">
        <div
          v-if="gameListOpen"
          class="game-switch-mask"
          role="dialog"
          aria-modal="true"
          @click.self="closeGameList"
        >
          <div class="game-switch-panel">
            <section v-for="g in gameGroups" :key="g.id" class="game-group">
              <div class="game-group__head">
                <div class="game-group__title">{{ g.title }}</div>
                <div class="game-group__meta" :class="{ danger: g.status === '封盘中' }">
                  <template v-if="g.status">{{ g.status }}</template>
                  <template v-else>{{ g.countdown }}</template>
                </div>
              </div>

              <div class="room-grid">
                <button
                  v-for="r in g.rooms"
                  :key="r.id"
                  type="button"
                  class="room-btn"
                  :class="{ active: r.id === activeRoomId }"
                  @click="selectRoom(g, r)"
                >
                  {{ r.label }}
                </button>
              </div>
            </section>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="right-menu-fade">
        <div v-show="rightMenuOpen" class="right-menu-mask" @click.self="closeRightMenu">
          <div class="right-menu" role="menu" @click.stop>
            <div
              v-for="item in rightMenuItems"
              :key="item.key"
              class="right-menu-item"
              role="menuitem"
              tabindex="0"
              @click="onRightMenuClick(item)"
              @keydown.enter.prevent="onRightMenuClick(item)"
              @keydown.space.prevent="onRightMenuClick(item)"
            >
              <img class="right-menu-icon" :src="item.icon" alt="" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <!-- 与底部 van-popup 一致：遮罩单独淡出 + 面板下滑，避免遮罩 opacity 叠在面板上 -->
      <transition name="haolu-popup-dim">
        <div
          v-if="haoluPopupOpen"
          class="haolu-popup-dim"
          aria-hidden="true"
          @click.self="closeHaoluPopup"
        />
      </transition>
      <transition name="haolu-popup-slide">
        <HaoluPopup
          v-if="haoluPopupOpen"
          :top="haoluPopupTop"
          role="dialog"
          aria-modal="true"
          @close="closeHaoluPopup"
        />
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="mipai-fade">
        <div v-if="miPopupOpen" class="mipai-mask" role="dialog" aria-modal="true" @click.self="closeMiPopup">
          <div class="mipai-panel" @click.stop>
            <div class="mipai-panel__head">
              <img class="mipai-qiu mipai-qiu--left" :src="miQiu1Src" alt="" aria-hidden="true" />
              <div class="mipai-head-pill">
                <div class="mipai-head-text">第 <span class="issue">{{ miIssue }}</span> 期开奖结果</div>
              </div>
              <img class="mipai-qiu mipai-qiu--right" :src="miQiu2Src" alt="" aria-hidden="true" />
            </div>

            <div class="mipai-panel__body">
              <div ref="miScratchWrapRef" class="mipai-scratch-wrap">
                <div class="mipai-result-row" aria-label="开奖结果">
                  <div class="ball red">{{ miNums[0] }}</div>
                  <div class="op">+</div>
                  <div class="ball blue">{{ miNums[1] }}</div>
                  <div class="op">+</div>
                  <div class="ball red">{{ miNums[2] }}</div>
                  <div class="op">=</div>
                  <div class="ball sum">{{ miSum }}</div>
                </div>

                <canvas v-show="!miScratched" ref="miCanvasRef" class="mipai-scratch-canvas" aria-label="刮开涂层" />
              </div>
            </div>

            <div class="mipai-panel__foot">
              <div class="mipai-foot-pill">
                <div class="mipai-countdown">
                  <div class="line">截止 <span class="issue">{{ miIssue }}</span> 期投注： <span class="sec">{{ miLeft1 }}</span> 秒</div>
                  <div class="line">截止 <span class="issue">{{ miIssue }}</span> 期投注： <span class="sec">{{ miLeft2 }}</span> 秒</div>
                </div>
                <div
                  class="mipai-refresh"
                  role="button"
                  tabindex="0"
                  aria-label="刷新"
                  @click="onMiRefresh"
                  @keydown.enter.prevent="onMiRefresh"
                  @keydown.space.prevent="onMiRefresh"
                >
                  刷新
                </div>
              </div>
            </div>
          </div>

          <div
            class="mipai-close"
            role="button"
            tabindex="0"
            aria-label="关闭"
            @click="closeMiPopup"
            @keydown.enter.prevent="closeMiPopup"
            @keydown.space.prevent="closeMiPopup"
          >
            <img class="mipai-close-img" :src="miCloseSrc" alt="" aria-hidden="true" />
          </div>
        </div>
      </transition>
    </teleport>

    <main class="game-room-body" :class="{ 'is-group-vote': groupVoteMode }">
      <div class="game-room-content">
        <LivePlayer src="" />

        <NextResultBar
          ref="nextResultBarRef"
          :issue="nextIssueText"
          :nums="nextNums"
          :sum="nextSum"
          @action="onNextResultAction"
        />

        <GroupVoteWorkspace
          v-if="groupVoteMode"
          :balance="balance"
          @submit="onBetPanelSubmit"
          @chase="onGroupVoteChase"
          @open-recent="onGroupVoteOpenRecent"
        />

        <section v-else class="room-tabs-bar" aria-label="内容切换">
          <van-tabs
            v-model:active="roomActiveKey"
            class="room-tabs-vant"
            line-height="6px"
            color="#0065FF"
            title-inactive-color="#8C8C8C"
            title-active-color="#0065FF"
            :animated="false"
          >
            <van-tab name="hall" title="大厅" />
            <van-tab name="chat" title="聊天" />
            <van-tab name="bets" title="注单" />

            <template #nav-right>
              <div class="room-tabs-actions">
                <div
                  class="mi-btn"
                  role="button"
                  tabindex="0"
                  aria-label="咪牌"
                  @click="onMiCard"
                  @keydown.enter.prevent="onMiCard"
                  @keydown.space.prevent="onMiCard"
                >
                  <span class="mi-btn__text">咪牌</span>
                </div>

                <div
                  class="amount-box"
                  role="button"
                  tabindex="0"
                  aria-label="金额信息，点击充值"
                  @click="depositPopupOpen = true"
                  @keydown.enter.prevent="depositPopupOpen = true"
                  @keydown.space.prevent="depositPopupOpen = true"
                >
                  <div class="amount-ticker" aria-live="polite">
                    <div class="amount-ticker__track" :class="{ 'is-second': amountTickerIndex === 1 }">
                      <div class="amount-ticker__item" aria-label="上期盈亏">
                        <span class="amount-box__label">上期盈亏</span>
                        <span class="amount-box__value" :class="profitClass">{{ profitText }}</span>
                      </div>
                      <div class="amount-ticker__item" aria-label="余额">
                        <span class="amount-box__label">余额</span>
                        <span class="amount-box__value is-balance">{{ balanceText }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="plus-btn"
                  role="button"
                  tabindex="0"
                  aria-label="加号"
                  @click="onPlus"
                  @keydown.enter.prevent="onPlus"
                  @keydown.space.prevent="onPlus"
                >
                  <img class="plus-btn__icon" :src="iconPlus" alt="" aria-hidden="true" />
                </div>
              </div>
            </template>
          </van-tabs>
        </section>
      </div>
    </main>

    <footer v-show="!inputPopupOpen && !groupVoteMode" class="room-bottom-bar" aria-label="底部输入栏" @click.stop>
      <img class="help-btn__icon" :src="iconYw" alt="" aria-hidden="true" />

      <div class="input-wrap">
        <div
          class="room-input"
          role="button"
          tabindex="0"
          :class="{ 'is-placeholder': !bottomInput }"
          :aria-label="bottomInput ? `输入内容：${bottomInput}` : inputPlaceholder"
          @click="onOpenInput"
          @keydown.enter.prevent="onOpenInput"
          @keydown.space.prevent="onOpenInput"
        >
          {{ inputPlaceholder }}
        </div>
      </div>

      <div class="bottom-actions">
        <button type="button" class="action-btn action-btn--chat" @click="onOpenChat">
          聊天
        </button>
        <button type="button" class="action-btn action-btn--bet" :disabled="betDisabled" @click="onOpenBet">
          下注
        </button>
      </div>
    </footer>

    <!-- 右下角悬浮菜单：分享/专业模式/打赏/推荐好路/匿名模式 + 盈亏/投注记录展开收起 -->
    <div class="float-side-menu" v-show="!inputPopupOpen" @click.stop>
      <div class="float-side-menu__list">
        <div
          class="float-side-menu__toggle"
          role="button"
          tabindex="0"
          aria-label="展开/收起菜单"
          @click="toggleSideMenu"
          @keydown.enter.prevent="toggleSideMenu"
          @keydown.space.prevent="toggleSideMenu"
        >
          <img
            class="float-side-menu__toggle-icon"
            :src="sideMenuExpanded ? iconSideMenuHide : iconSideMenuShow"
            alt=""
            aria-hidden="true"
          />
          <div v-if="!sideMenuExpanded" class="float-side-menu__name float-side-menu__name--white">菜单</div>
        </div>

        <div
          v-show="sideMenuExpanded"
          class="float-side-menu__item"
          role="button"
          tabindex="0"
          aria-label="投注记录"
          @click="goBetRecord"
          @keydown.enter.prevent="goBetRecord"
          @keydown.space.prevent="goBetRecord"
        >
          <img class="float-side-menu__icon" :src="iconTouzhuSide" alt="" aria-hidden="true" />
          <div class="float-side-menu__name float-side-menu__name--white">投注记录</div>
        </div>

        <div
          v-show="sideMenuExpanded"
          class="float-side-menu__item"
          role="button"
          tabindex="0"
          aria-label="盈亏"
          @click="goProfitLoss"
          @keydown.enter.prevent="goProfitLoss"
          @keydown.space.prevent="goProfitLoss"
        >
          <img class="float-side-menu__icon" :src="iconYingkui" alt="" aria-hidden="true" />
          <div class="float-side-menu__name float-side-menu__name--white">盈亏</div>
        </div>

        <div class="float-side-menu__item">
          <div class="float-side-menu__niming-switch">
            <van-switch v-model="anonymousEnabled" :size="12" />
          </div>
          <img class="float-side-menu__icon" :src="iconNiming" alt="" aria-hidden="true" />
          <div class="float-side-menu__name float-side-menu__name--white">匿名模式</div>
        </div>

        <div
          class="float-side-menu__item"
          role="button"
          tabindex="0"
          aria-label="推荐好路"
          @click="openHaoluPopup"
          @keydown.enter.prevent="openHaoluPopup"
          @keydown.space.prevent="openHaoluPopup"
        >
          <img class="float-side-menu__icon" :src="iconHaolu" alt="" aria-hidden="true" />
          <div class="float-side-menu__name float-side-menu__name--haolu">推荐好路</div>
        </div>

        <div
          class="float-side-menu__item"
          role="button"
          tabindex="0"
          aria-label="打赏"
          @click="openDashangPopup"
          @keydown.enter.prevent="openDashangPopup"
          @keydown.space.prevent="openDashangPopup"
        >
          <img class="float-side-menu__icon" :src="iconDashang" alt="" aria-hidden="true" />
          <div class="float-side-menu__name float-side-menu__name--dashang">打赏</div>
        </div>

        <div
          class="float-side-menu__item"
          role="button"
          tabindex="0"
          :aria-label="groupVoteMode ? '群投模式，点击切回专业模式' : '专业模式，点击切换为群投模式'"
          :aria-pressed="groupVoteMode ? 'true' : 'false'"
          @click="toggleGroupVoteMode"
          @keydown.enter.prevent="toggleGroupVoteMode"
          @keydown.space.prevent="toggleGroupVoteMode"
        >
          <img
            class="float-side-menu__icon"
            :src="groupVoteMode ? iconQtms : iconZhuanye"
            alt=""
            aria-hidden="true"
          />
          <div
            class="float-side-menu__name"
            :class="groupVoteMode ? 'float-side-menu__name--qtms' : 'float-side-menu__name--zhuanye'"
          >
            {{ groupVoteMode ? '群投模式' : '专业模式' }}
          </div>
        </div>

        <div class="float-side-menu__item">
          <img class="float-side-menu__icon" :src="iconFenxiang" alt="" aria-hidden="true" />
          <div class="float-side-menu__name float-side-menu__name--fenxiang">分享</div>
        </div>
      </div>
    </div>

    <van-popup
      v-model:show="inputPopupOpen"
      position="bottom"
      class="room-input-popup"
      :overlay="true"
      :safe-area-inset-bottom="true"
      @opened="focusPopupInput"
    >
      <div class="room-input-popup__handle" role="button" tabindex="0" aria-label="关闭" @click="closeInputPopup">
        <img class="room-input-popup__caret" :src="iconCaretDown" alt="" aria-hidden="true" />
      </div>

      <div class="room-input-popup__body">
        <textarea
          ref="popupInputRef"
          v-model="bottomInput"
          class="room-input-popup__textarea"
          :class="{ 'is-chat': inputMode === 'chat' }"
          :placeholder="popupPlaceholder"
          rows="3"
        />
        <div
          class="room-input-popup__send"
          :class="{ 'is-icon': inputMode === 'chat', 'is-disabled': sendDisabled }"
          role="button"
          tabindex="0"
          :aria-disabled="sendDisabled ? 'true' : 'false'"
          @click="!sendDisabled && onPopupSend()"
          @keydown.enter.prevent="!sendDisabled && onPopupSend()"
          @keydown.space.prevent="!sendDisabled && onPopupSend()"
        >
          <img v-if="inputMode === 'chat'" class="room-input-popup__send-icon" :src="iconSend" alt="" aria-hidden="true" />
          <template v-else>{{ sendButtonText }}</template>
        </div>
      </div>
    </van-popup>

    <BetPanel
      ref="betPanelRef"
      v-model:show="betPanelOpen"
      :title="currentGameTitle"
      :issue="headerIssueNo"
      :countdown="headerTimeText"
      :balance="balance"
      :top="betPanelTop"
      @submit="onBetPanelSubmit"
    />

    <DashangPopup v-model:show="dashangPopupOpen" @confirm="onDashangConfirm" />
    <GameDepositPopup v-model:show="depositPopupOpen" />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/components/Toast'
import GameNavBar from './components/GameNavBar.vue'
import NextResultBar from './components/NextResultBar.vue'
import BetPanel from './bet-panel/BetPanel.vue'
import GroupVoteWorkspace from './GroupVoteWorkspace.vue'
import iconTouzhu from '@/assets/touzhu_icon.png'
import iconJieshao from '@/assets/jieshao_icon.png'
import iconXianhong from '@/assets/xianhong_icon.png'
import iconShezhi from '@/assets/shezhi_icon.png'
import LivePlayer from './components/LivePlayer.vue'
import iconPlus from '@/assets/icon_add.png'
import iconYw from '@/assets/icon_yw.png'
import iconCaretDown from '@/assets/down_icon.png'
import iconSend from '@/assets/icon_send.png'
import iconFenxiang from '@/assets/silder_fenxiang.png'
import iconZhuanye from '@/assets/silder_zhuanye.png'
import iconQtms from '@/assets/icon_qtms.png'
import iconDashang from '@/assets/silder_dashang.png'
import iconHaolu from '@/assets/silder_haolu.png'
import iconNiming from '@/assets/silder_niming.png'
import iconYingkui from '@/assets/silder_yingkui.png'
import iconTouzhuSide from '@/assets/silder_touzhu.png'
import iconSideMenuShow from '@/assets/silder_caidan.png'
import iconSideMenuHide from '@/assets/silder_yincang.png'
import HaoluPopup from './haolu/HaoluPopup.vue'
import DashangPopup from './components/DashangPopup.vue'
import GameDepositPopup from '@/views/game/components/GameDepositPopup.vue'
import miCloseSrc from '@/assets/mipai_close.svg'
import miQiu1Src from '@/assets/mipai_qiu1.png'
import miQiu2Src from '@/assets/mipai_qiu2.png'

const router = useRouter()
const betPanelRef = ref(null)

const gameListOpen = ref(false)
const rightMenuOpen = ref(false)
const haoluPopupOpen = ref(false)
const dashangPopupOpen = ref(false)
const depositPopupOpen = ref(false)
const activeGameId = ref('g-3')
const activeRoomId = ref('g-3-r-1')
const sideMenuExpanded = ref(false)
const anonymousEnabled = ref(false)
/** 专业模式 ↔ 群投模式（仅 UI 状态，后续可接业务） */
const groupVoteMode = ref(false)

// TODO: 后续接接口数据；当前用静态数据把交互/样式跑通
const gameGroups = ref([
  {
    id: 'g-1',
    title: '比特币28',
    countdown: '00:00:21',
    status: '',
    rooms: [
      { id: 'g-1-r-1', label: '普通房1元起' },
      { id: 'g-1-r-2', label: '贵宾房10元起' },
      { id: 'g-1-r-3', label: '高赔率30元起' }
    ]
  },
  {
    id: 'g-2',
    title: '台湾宾果28',
    countdown: '',
    status: '封盘中',
    rooms: [
      { id: 'g-2-r-1', label: '普通房1元起' },
      { id: 'g-2-r-2', label: '贵宾房10元起' },
      { id: 'g-2-r-3', label: '高赔率30元起' }
    ]
  },
  {
    id: 'g-3',
    title: '加拿大28',
    countdown: '00:00:21',
    status: '',
    rooms: [
      { id: 'g-3-r-1', label: '普通房1元起' },
      { id: 'g-3-r-2', label: '贵宾房10元起' },
      { id: 'g-3-r-3', label: '高赔率30元起' }
    ]
  },
  {
    id: 'g-4',
    title: '加拿大西28',
    countdown: '02:12:24',
    status: '',
    rooms: [
      { id: 'g-4-r-1', label: '普通房1元起' },
      { id: 'g-4-r-2', label: '贵宾房10元起' },
      { id: 'g-4-r-3', label: '高赔率30元起' }
    ]
  }
])

const currentGameTitle = computed(() => gameGroups.value.find((x) => x.id === activeGameId.value)?.title ?? '加拿大28')

const currentRoomText = computed(() => {
  for (const g of gameGroups.value) {
    const r = g.rooms.find((x) => x.id === activeRoomId.value)
    if (r) return r.label
  }
  return ''
})

const headerTimeText = ref('02:12:24')
const headerIssueNo = ref('312311111期')
const headerStatusText = ref('投注中')

const nextIssueText = ref('3123111110期')
const nextNums = ref([7, 2, 6])
const nextSum = computed(() => nextNums.value.reduce((a, b) => a + Number(b || 0), 0))

const roomTabs = [
  { key: 'hall', label: '大厅' },
  { key: 'chat', label: '聊天' },
  { key: 'bets', label: '注单' }
]
const roomActiveKey = ref('hall')
const lastProfit = ref(188)
const balance = ref(89685.5)
const amountTickerIndex = ref(0) // 0: 盈亏, 1: 余额
let amountTickerTimer

const bottomInput = ref('')
const inputPopupOpen = ref(false)
const popupInputRef = ref(null)
const inputMode = ref('bet') // bet | chat
const betPanelOpen = ref(false)

const inputPlaceholder = computed(() => {
  if (roomActiveKey.value === 'chat') return '输入内容...'
  return '输入文字可以快速下注'
})

const betDisabled = computed(() => {
  // 下注面板打开不依赖底部输入框内容；后续可接封盘/限红等状态
  return false
})

const popupPlaceholder = computed(() => {
  if (inputMode.value === 'chat') return '说点什么...'
  return `下注示例：\n· 大小单双的下注指令示例\n[大100][da100][小100][x100][单100][d100]`
})

const sendButtonText = computed(() => '发送投注')
const sendDisabled = computed(() => !bottomInput.value)

const profitText = computed(() => {
  const v = Number(lastProfit.value || 0)
  const abs = Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  if (v < 0) return `-${abs}`
  return `${abs}`
})

const profitClass = computed(() => {
  const v = Number(lastProfit.value || 0)
  if (v < 0) return 'is-negative'
  return 'is-positive'
})

const balanceText = computed(() => {
  const v = Number(balance.value || 0)
  if (!Number.isFinite(v)) return '0'
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const nextResultBarRef = ref(null)
const nextResultPopupOpen = ref(false)
const nextResultPopupTop = ref(0)
const nextResultPopupTopCss = computed(() => `${Math.max(0, Number(nextResultPopupTop.value || 0))}px`)
const lastValidNextResultPopupTop = ref(0)

const betPanelTop = ref(0)
const lastValidBetPanelTop = ref(0)

const trendRows = ref([
  { issue: '333338', nums: [6, 2, 6], bigSmall: '大', oddEven: '双', extreme1: '', extreme2: '', tail: 6 },
  { issue: '333337', nums: [0, 1, 0], bigSmall: '小', oddEven: '单', extreme1: '极小', extreme2: '对子', tail: 1 },
  { issue: '333336', nums: [6, 2, 6], bigSmall: '大', oddEven: '双', extreme1: '', extreme2: '', tail: 6 },
  { issue: '333335', nums: [0, 1, 0], bigSmall: '小', oddEven: '单', extreme1: '极小', extreme2: '对子', tail: 1 },
  { issue: '333334', nums: [6, 2, 6], bigSmall: '大', oddEven: '双', extreme1: '', extreme2: '', tail: 6 },
  { issue: '333333', nums: [0, 1, 0], bigSmall: '小', oddEven: '单', extreme1: '', extreme2: '', tail: 1 }
])

function measureNextResultBarBottom() {
  const inst = nextResultBarRef.value
  const el = inst?.$el ?? inst
  const rect = el?.getBoundingClientRect?.() ?? document.querySelector('.next-result-bar')?.getBoundingClientRect?.()
  if (!rect) return
  const bottom = Number(rect.bottom)
  if (!Number.isFinite(bottom) || bottom <= 0) return
  nextResultPopupTop.value = bottom
  lastValidNextResultPopupTop.value = bottom
  betPanelTop.value = bottom
  lastValidBetPanelTop.value = bottom
}

async function openNextResultPopup() {
  // 先用上一次有效值兜底，避免测量失败时跳到顶部
  if (lastValidNextResultPopupTop.value > 0) nextResultPopupTop.value = lastValidNextResultPopupTop.value
  nextResultPopupOpen.value = true
  await nextTick()
  measureNextResultBarBottom()
  // 再等一帧，确保布局稳定（尤其是快速关闭/再打开、或有过渡动画时）
  requestAnimationFrame(() => {
    measureNextResultBarBottom()
  })
}

function closeNextResultPopup() {
  nextResultPopupOpen.value = false
}

function onViewFullTrend() {
  closeNextResultPopup()
  router.push({
    name: 'gameTrend',
    query: {
      gameId: activeGameId.value,
      gameName: currentGameTitle.value
    }
  })
}

function onViewportChange() {
  if (!nextResultPopupOpen.value && !betPanelOpen.value && !haoluPopupOpen.value) return
  measureNextResultBarBottom()
  if (haoluPopupOpen.value) {
    haoluPopupTop.value = Math.max(0, Number(nextResultPopupTop.value || lastValidNextResultPopupTop.value || 0))
  }
}

function preloadMenuIcons(urls) {
  urls.forEach((url) => {
    if (!url) return
    const img = new Image()
    img.decoding = 'async'
    img.src = url
  })
}

onMounted(() => {
  preloadMenuIcons([
    iconTouzhu,
    iconJieshao,
    iconXianhong,
    iconShezhi,
    iconTouzhuSide,
    iconYingkui,
    iconSideMenuShow,
    iconSideMenuHide,
    iconQtms
  ])

  window.addEventListener('resize', onViewportChange, { passive: true })
  window.addEventListener('scroll', onViewportChange, { passive: true, capture: true })

  if (amountTickerTimer) clearInterval(amountTickerTimer)
  amountTickerTimer = setInterval(() => {
    amountTickerIndex.value = amountTickerIndex.value === 0 ? 1 : 0
  }, 10000)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
  if (amountTickerTimer) clearInterval(amountTickerTimer)
  stopMiCountdown()
})

const rightMenuItems = [
  { key: 'bet', label: '投注记录', icon: iconTouzhu },
  { key: 'intro', label: '彩种介绍', icon: iconJieshao },
  { key: 'limit', label: '游戏限红', icon: iconXianhong },
  { key: 'settings', label: '设置', icon: iconShezhi }
]

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function toggleSideMenu() {
  sideMenuExpanded.value = !sideMenuExpanded.value
}

function toggleGroupVoteMode() {
  groupVoteMode.value = !groupVoteMode.value
}

function goProfitLoss() {
  betPanelRef.value?.openBetRecordPanel?.()
}

/** 悬浮/右上角菜单「投注记录」：只打开近期投注弹层（与主投注面板同级，见 BetPanel） */
function openRecentBetsFromRoomMenu() {
  sideMenuExpanded.value = false
  if (lastValidBetPanelTop.value > 0) betPanelTop.value = lastValidBetPanelTop.value
  nextTick(() => {
    measureNextResultBarBottom()
    betPanelRef.value?.openRecentBetsPanel?.()
    requestAnimationFrame(() => measureNextResultBarBottom())
  })
}

function goBetRecord() {
  openRecentBetsFromRoomMenu()
}

function onToggleGameList() {
  rightMenuOpen.value = false
  gameListOpen.value = !gameListOpen.value
}

function onMenu() {
  gameListOpen.value = false
  rightMenuOpen.value = !rightMenuOpen.value
}

function closeGameList() {
  gameListOpen.value = false
}

function selectRoom(game, room) {
  activeGameId.value = game.id
  activeRoomId.value = room.id
  gameListOpen.value = false
}

function closeRightMenu() {
  rightMenuOpen.value = false
}

function onRightMenuClick(item) {
  rightMenuOpen.value = false
  if (item.key === 'bet') {
    openRecentBetsFromRoomMenu()
    return
  }
  if (item.key === 'settings') {
    router.push('/settings')
    return
  }
  // intro / limit：后续接弹窗或页面
}

const haoluPopupTop = ref(0)

function openHaoluPopup() {
  if (lastValidNextResultPopupTop.value > 0) haoluPopupTop.value = lastValidNextResultPopupTop.value
  haoluPopupOpen.value = true
  nextTick(() => {
    measureNextResultBarBottom()
    haoluPopupTop.value = Math.max(0, Number(nextResultPopupTop.value || lastValidNextResultPopupTop.value || 0))
    requestAnimationFrame(() => {
      measureNextResultBarBottom()
      haoluPopupTop.value = Math.max(0, Number(nextResultPopupTop.value || lastValidNextResultPopupTop.value || 0))
    })
  })
}

function closeHaoluPopup() {
  haoluPopupOpen.value = false
}

function openDashangPopup() {
  dashangPopupOpen.value = true
}

function onDashangConfirm({ amount }) {
  toast(`已提交打赏 ¥${amount}（演示）`)
}

function onNextResultAction() {
  // 展示“下期/往期开奖”弹窗
  if (nextResultPopupOpen.value) closeNextResultPopup()
  else openNextResultPopup()
}

function onMiCard() {
  openMiPopup()
}

function onPlus() {
  // TODO: 后续接“加号”入口
}

function onHelp() {
  toast('输入内容可快速下注/聊天')
}

const miPopupOpen = ref(false)
const miIssue = ref('04060851')
const miNums = ref([7, 2, 6])
const miSum = computed(() => miNums.value.reduce((a, b) => a + Number(b || 0), 0))
const miLeft1 = ref(11)
const miLeft2 = ref(21)

const miScratched = ref(false)
const miCanvasRef = ref(null)
const miScratchWrapRef = ref(null)
let miTimer

function openMiPopup() {
  miScratched.value = false
  miPopupOpen.value = true
  nextTick(() => {
    setupMiScratch()
    startMiCountdown()
  })
}

function closeMiPopup() {
  miPopupOpen.value = false
  stopMiCountdown()
}

function startMiCountdown() {
  stopMiCountdown()
  miTimer = setInterval(() => {
    if (miLeft1.value > 0) miLeft1.value -= 1
    if (miLeft2.value > 0) miLeft2.value -= 1
  }, 1000)
}

function stopMiCountdown() {
  if (miTimer) clearInterval(miTimer)
  miTimer = undefined
}

function onMiRefresh() {
  // TODO: 后续接接口刷新
  miLeft1.value = 11
  miLeft2.value = 21
  miScratched.value = false
  nextTick(() => setupMiScratch())
}

function setupMiScratch() {
  const canvas = miCanvasRef.value
  const wrap = miScratchWrapRef.value
  if (!canvas || !wrap) return

  const rect = wrap.getBoundingClientRect()
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
  const w = Math.max(1, Math.floor(rect.width))
  const h = Math.max(1, Math.floor(rect.height))
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#cfcfcf'
  ctx.fillRect(0, 0, w, h)

  // 把提示文字画在“涂层”上，这样刮的时候会一起被刮掉
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.font = '700 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('已有结果，请刮涂层', w / 2, h / 2)

  ctx.globalCompositeOperation = 'destination-out'
  const radius = 18
  let drawing = false
  let lastX = 0
  let lastY = 0

  function pointFromEvent(e) {
    const r = canvas.getBoundingClientRect()
    const p = e.touches?.[0] ?? e.changedTouches?.[0] ?? e
    const x = (p.clientX ?? 0) - r.left
    const y = (p.clientY ?? 0) - r.top
    return { x, y }
  }

  function drawLine(x1, y1, x2, y2) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = radius * 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  function scratchAt(x, y) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  function checkProgress() {
    try {
      const step = 10
      const img = ctx.getImageData(0, 0, w, h).data
      let cleared = 0
      let total = 0
      for (let yy = 0; yy < h; yy += step) {
        for (let xx = 0; xx < w; xx += step) {
          const idx = (yy * w + xx) * 4 + 3
          total += 1
          if (img[idx] === 0) cleared += 1
        }
      }
      const ratio = total ? cleared / total : 0
      if (ratio >= 0.35) miScratched.value = true
    } catch {
      // ignore
    }
  }

  function onDown(e) {
    e.preventDefault?.()
    drawing = true
    const { x, y } = pointFromEvent(e)
    lastX = x
    lastY = y
    scratchAt(x, y)
  }

  function onMove(e) {
    if (!drawing) return
    e.preventDefault?.()
    const { x, y } = pointFromEvent(e)
    drawLine(lastX, lastY, x, y)
    lastX = x
    lastY = y
  }

  function onUp(e) {
    if (!drawing) return
    e.preventDefault?.()
    drawing = false
    checkProgress()
  }

  canvas.onpointerdown = onDown
  canvas.onpointermove = onMove
  canvas.onpointerup = onUp
  canvas.onpointercancel = onUp
  canvas.ontouchstart = onDown
  canvas.ontouchmove = onMove
  canvas.ontouchend = onUp
  canvas.ontouchcancel = onUp
}

function onEnter() {
  if (roomActiveKey.value === 'chat') onChat()
  else onBet()
}

function onOpenInput() {
  bottomInput.value = ''
  inputMode.value = roomActiveKey.value === 'chat' ? 'chat' : 'bet'
  inputPopupOpen.value = true
}

function onOpenChat() {
  bottomInput.value = ''
  inputMode.value = 'chat'
  inputPopupOpen.value = true
}

function onOpenBet() {
  if (lastValidBetPanelTop.value > 0) betPanelTop.value = lastValidBetPanelTop.value
  betPanelOpen.value = true
  nextTick(() => {
    measureNextResultBarBottom()
    requestAnimationFrame(() => measureNextResultBarBottom())
  })
}

function closeInputPopup() {
  bottomInput.value = ''
  inputPopupOpen.value = false
}

async function focusPopupInput() {
  await nextTick()
  const el = popupInputRef.value
  if (el?.focus) el.focus()
}

function onPopupSend() {
  if (inputMode.value === 'chat') onChat()
  else onBet()
  closeInputPopup()
}

function onChat() {
  const text = bottomInput.value
  if (!text) return
  toast(`聊天：${text}`)
  bottomInput.value = ''
}

function onBet() {
  const text = bottomInput.value
  if (!text) return
  toast(`下注：${text}`)
  bottomInput.value = ''
}

function onBetPanelSubmit(payload) {
  // 先占位：后续接真实投注接口/限红校验/订单确认
  const keys =
    Array.isArray(payload.playKeys) && payload.playKeys.length > 0
      ? payload.playKeys.join(',')
      : payload.playKey
  toast(`面板下注：${keys} x ${payload.amount}`)
}

function onGroupVoteChase() {
  router.push('/chase-order')
}

function onGroupVoteOpenRecent() {
  betPanelRef.value?.openRecentBetsPanel?.()
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.game-room-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: var(--browser-ui-bottom, 0px);
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-color);
}

.next-result-popup-fade-enter-active,
.next-result-popup-fade-leave-active {
  transition: opacity 140ms ease;
}

.next-result-popup-fade-enter-from,
.next-result-popup-fade-leave-to {
  opacity: 0;
}

.next-result-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 98;
  background: rgba(0, 0, 0, 0.5);
}

.next-result-popup-panel {
  position: fixed;
  left: 50%;
  width: 376px;
  height: 308px;
  transform: translateX(-50%);
  background: #fff;
  overflow: hidden;
}

.next-result-popup-panel__body {
  height: 248px;
  overflow: hidden;
}

.trend-table {
  height: 100%;
  overflow: hidden;
}

.trend-table::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.trend-row {
  display: flex;
  align-items: center;
  height: 36px;
  box-sizing: border-box;
  background: #ffffff;
}

.trend-row--head {
  height: 34px;
  background: #e5efff;
  font-size: @font-size-sm;
  color: #1d1d1f;
  font-weight: 400;
}

.trend-row:nth-child(even):not(.trend-row--head) {
  background: #e5efff;
}

.col {
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: @font-size-sm;
  color: #1d1d1f;
  border-right: 1px solid #dbe7ff;
}

.trend-row .col:last-child {
  border-right: none;
}

.col-issue {
  width: 78px;
}
.col-nums {
  width: 112px;
  gap: 4px;
}
.col-sum {
  width: 78px;
  gap: 6px;
}
.col-ext1 {
  width: 52px;
}
.col-ext2 {
  width: 52px;
}
.col-tail {
  width: 54px;
}

.ball {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  box-sizing: border-box;
  background: #fff;
}

.ball.red {
  border: 1px solid #ff3b30;
  color: #1d1d1f;
}

.ball.blue {
  border: 1px solid #1f78ff;
  color: #1d1d1f;
}

.tag {
  font-size: @font-size-sm;
  line-height: 1;
  font-weight: 400;
}

.tag-blue {
  color: #1f78ff;
}

.tag-red {
  color: #ff3b30;
}

.tail {
  font-weight: 400;
}

.next-result-popup-panel__footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 12px;
  box-sizing: border-box;
  background: #e5efff;
}

.btn {
  height: 34px;
  border: none;
  border-radius: 6px;
  font-size: @font-size-md;
  font-weight: 400;
}

.btn-ghost {
  width: 120px;
  background: var(--s-5-b-8-c-8-e-3, #b8c8e3);
  color: #ffffff;
}

.btn-primary {
  width: 221px;
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.game-switch-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 48px; // 导航高度
  z-index: 90;
  background: rgba(0, 0, 0, 0.5);
}

.game-switch-panel {
  padding: 18px @spacing-md 22px;
}

.game-switch-fade-enter-active,
.game-switch-fade-leave-active {
  transition: opacity 140ms ease;
}

.game-switch-fade-enter-from,
.game-switch-fade-leave-to {
  opacity: 0;
}

.game-switch-fade-enter-active .game-switch-panel,
.game-switch-fade-leave-active .game-switch-panel {
  transition: transform 140ms ease;
}

.game-switch-fade-enter-from .game-switch-panel,
.game-switch-fade-leave-to .game-switch-panel {
  transform: translateY(-6px);
}

.right-menu-fade-enter-active,
.right-menu-fade-leave-active {
  transition: opacity 140ms ease;
}

.right-menu-fade-enter-from,
.right-menu-fade-leave-to {
  opacity: 0;
}

/* 好路弹窗：对齐底部 van-popup（遮罩淡出 + 内容 translateY(100%)，约 0.3s） */
.haolu-popup-dim {
  position: fixed;
  inset: 0;
  z-index: 96;
  background: rgba(0, 0, 0, 0.5);
}

.haolu-popup-dim-enter-active {
  transition: opacity 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.haolu-popup-dim-leave-active {
  transition: opacity 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.haolu-popup-dim-enter-from,
.haolu-popup-dim-leave-to {
  opacity: 0;
}

.right-menu-mask {
  position: fixed;
  inset: 0;
  z-index: 95;
  background: rgba(0, 0, 0, 0.5);
}

.right-menu {
  position: absolute;
  right: @spacing-md;
  top: 56px;
  width: 95px;
  height: 127px;
  border-radius: 8px;
  background: var(--s-2-ffffff, #fff);
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  box-sizing: border-box;
}

.right-menu-item {
  height: 28px;
  padding: 0 10px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d1d1f;
  font-size: @font-size-sm;
  line-height: 1;
  text-align: left;
}

.mipai-fade-enter-active,
.mipai-fade-leave-active {
  transition: opacity 140ms ease;
}

.mipai-fade-enter-from,
.mipai-fade-leave-to {
  opacity: 0;
}

.mipai-mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.mipai-panel {
  width: 345px;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
}

.mipai-panel__head {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #fff;
}

.mipai-qiu {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.mipai-qiu--left {
  margin-right: -5px;
}

.mipai-qiu--right {
  margin-left: -5px;
}

.mipai-head-pill {
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mipai-head-text {
  font-size: @font-size-xl;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.mipai-head-text .issue {
  color: #ffe55a;
  font-variant-numeric: tabular-nums;
}

.mipai-panel__body {
  background: #fff;
}

.mipai-scratch-wrap {
  position: relative;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mipai-result-row {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.mipai-result-row .op {
  font-size: @font-size-xl;
  font-weight: 700;
  color: #1d1d1f;
}

.mipai-result-row .ball {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: @font-size-3xl;
  font-weight: 700;
  box-sizing: border-box;
  background: #fff;
}

.mipai-result-row .ball.red {
  border: 2px solid #ff3b30;
  color: #1d1d1f;
}

.mipai-result-row .ball.blue {
  border: 2px solid #1f78ff;
  color: #1d1d1f;
}

.mipai-result-row .ball.sum {
  background: #1f78ff;
  color: #fff;
  border: none;
}

.mipai-scratch-canvas {
  position: absolute;
  inset: 0;
  touch-action: none;
}

.mipai-panel__foot {
  height: 64px;
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  box-sizing: border-box;
  gap: 10px;
}

.mipai-foot-pill {
  flex: 1 1 auto;
  min-width: 0;
  height: 44px;
  padding: 0 8px 0 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mipai-countdown {
  flex: 1 1 auto;
  min-width: 0;
  color: #fff;
  font-size: @font-size-md;
  line-height: 1.35;
}

.mipai-countdown .issue {
  color: #ffe55a;
  font-variant-numeric: tabular-nums;
}

.mipai-countdown .sec {
  color: #ffe55a;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.mipai-refresh {
  width: 88px;
  height: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: #1f78ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: @font-size-md;
  font-weight: 700;
  flex: 0 0 auto;
  cursor: pointer;
  user-select: none;
}

.mipai-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.mipai-close-img {
  width: 28px;
  height: 28px;
  display: block;
  object-fit: contain;
}

.right-menu-item + .right-menu-item {
  margin-top: 4px;
}

.right-menu-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
  flex: 0 0 auto;
}

.game-group + .game-group {
  margin-top: 16px;
}

.game-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #fff;
}

.game-group__title {
  font-size: @font-size-lg;
  font-weight: 400;
  line-height: 1.2;
}

.game-group__meta {
  font-size: @font-size-md;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;

  &.danger {
    color: #ff3b30;
    font-weight: 400;
  }
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(3, 110px);
  justify-content: space-between;
  column-gap: 10px;
  row-gap: 10px;
}

.room-btn {
  width: 110px;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  font-size: @font-size-md;
  font-weight: 400;
  line-height: 36px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.room-btn.active {
  border: 1px solid var(--p-00065-ff, #0065ff);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
}

.game-room-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.game-room-body.is-group-vote {
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.game-room-body.is-group-vote .game-room-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-room-content {
  padding: 0;
}

.room-bottom-bar {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 375px;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px calc(6px + env(safe-area-inset-bottom, 0px));
  background: #ffffff;
  border-top: 0.5px solid var(--t-2-dae-4-f-6, #dae4f6);
  z-index: 30;
}

.help-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #d7e2f5;
  background: #ffffff;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  cursor: pointer;
}

.help-btn__icon {
  width: 25px;
  height: 25px;
  display: block;
  object-fit: contain;
}

.input-wrap {
  flex: 1 1 auto;
  min-width: 0;
}

.room-input {
  width: 100%;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e7eefb;
  background: #f7faff;
  padding: 0 10px;
  box-sizing: border-box;
  font-size: @font-size-md;
  font-weight: 400;
  color: #1d1d1f;
  outline: none;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  user-select: none;
}

.room-input.is-placeholder {
  color: #9aa7bd;
}

.room-input:focus-visible {
  box-shadow: 0 0 0 2px rgba(0, 101, 255, 0.2);
}

.room-input-popup {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
}

.room-input-popup__handle {
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.room-input-popup__caret {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.room-input-popup__body {
  padding: 10px 12px 12px;
  display: flex;
  align-items: stretch;
  gap: 12px;
  box-sizing: border-box;
  background: #ffffff;
}

.room-input-popup__textarea {
  flex: 1 1 auto;
  min-width: 0;
  height: 92px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: #eef4ff;
  resize: none;
  outline: none;
  font-size: @font-size-md;
  font-weight: 400;
  line-height: 1.35;
  color: #1d1d1f;
  box-sizing: border-box;
}

.room-input-popup__textarea.is-chat {
  height: 35px;
  padding: 0 12px;
  line-height: 35px;
}

.room-input-popup__textarea::placeholder {
  color: #6a7892;
}

.room-input-popup__send {
  width: 92px;
  height: 34px;
  border-radius: 12px;
  background: #7fb1ff;
  color: #ffffff;
  font-size: @font-size-md;
  font-weight: 400;
  padding: 0 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.room-input-popup__send.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.room-input-popup__send.is-icon {
  width: 46px;
  border-radius: 0;
  background: transparent;
  padding: 0;
}

.room-input-popup__send-icon {
  width: 35px;
  height: 35px;
  display: block;
  object-fit: contain;
}

.bottom-actions {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 48px;
  height: 34px;
  border: none;
  border-radius: 8px;
  padding: 0;
  font-size: @font-size-md;
  font-weight: 400;
  color: #ffffff;
  cursor: pointer;
}

.action-btn--chat {
  background: #08d836;
}

.action-btn--bet {
  background: #0065ff;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.room-tabs-bar {
  width: 375px;
  height: 40px;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
  padding-right: 5px;
}

.room-tabs-vant {
  height: 40px;
}

.room-tabs-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
}

.amount-box {
  width: 122px;
  height: 28px;
  border-radius: 4px;
  background: var(--s-6-d-7-e-2-f-5, #d7e2f5);
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 0 8px;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.amount-ticker {
  width: 100%;
  height: 28px;
  overflow: hidden;
  display: block;
}

.amount-ticker__track {
  display: flex;
  flex-direction: column;
  transform: translate3d(0, 0, 0);
  transition: transform 420ms ease;
  will-change: transform;
}

.amount-ticker__track.is-second {
  transform: translate3d(0, -28px, 0);
}

.amount-ticker__item {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.amount-box__label {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #6a7892;
  line-height: 1;
  white-space: nowrap;
  flex: 0 0 auto;
}

.amount-box__value {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  text-align: right;
}

.amount-box__value.is-balance {
  color: #0065ff;
}

.amount-box__value.is-positive {
  color: #08d836;
}

.amount-box__value.is-negative {
  color: #ff3b30;
}

.mi-btn__text {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #ffffff;
  line-height: 1;
  white-space: nowrap;
}

.mi-btn {
  width: 44px;
  height: 26px;
  border-radius: 4px;
  background: var(--p-00065-ff, #0065ff);
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.plus-btn {
  width: 26px;
  height: 26px;
  border: none;
  padding: 0;
  border-radius: 4px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.plus-btn__icon {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
}

.float-side-menu {
  position: fixed;
  right: 14px;
  bottom: 58px;
  z-index: 45;
  pointer-events: auto;
}

.float-side-menu__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.float-side-menu__item {
  width: 38px;
  height: 38px;
  position: relative;
  display: block;
}

.float-side-menu__toggle {
  width: 38px;
  height: 38px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.float-side-menu__toggle-icon {
  width: 38px;
  height: 38px;
  display: block;
  object-fit: contain;
}

.float-side-menu__icon {
  width: 38px;
  height: 38px;
  display: block;
  object-fit: contain;
}

.float-side-menu__name {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(@font-size-xs - 2px);
  line-height: 15px;
  color: #ffffff;
  box-sizing: border-box;
  white-space: nowrap;
  user-select: none;
}

.float-side-menu__name--fenxiang {
  background: #0EE4A3;
}

.float-side-menu__name--zhuanye {
  background: #4b5aff;
}

.float-side-menu__name--qtms {
  background: #36df28;
}

.float-side-menu__name--dashang {
  background: #FFBC4F;
}

.float-side-menu__name--haolu {
  background: #25B1FF;
}

.float-side-menu__name--white {
  background: #FFFFFF;
  color: #1d1d1f;
}

.float-side-menu__niming-switch {
  /* 用于匿名模式顶部小开关 */
  position: absolute;
  top: 6px;
  right: 6px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.float-side-menu__niming-switch :deep(.van-switch) {
  /* 兜底：即使 Vant 内置尺寸，仍保证不会太大 */
  --van-switch-width: 28px;
  --van-switch-height: 18px;
  --van-switch-node-size: 14px;
  --van-switch-size: 14px;
}

</style>

