const VAR = '--browser-ui-bottom'

/** 浏览器底部工具栏/地址栏占用的高度（真机 WebView 中 safe-area 通常为 0） */
function readBrowserUiBottom() {
  const vv = window.visualViewport
  let inset = 0
  if (vv) {
    inset = window.innerHeight - vv.height - vv.offsetTop
  }
  inset = Math.max(0, Math.round(inset))
  // visualViewport 在部分真机浏览器中为 0，用 layout viewport 差值兜底
  if (inset < 8) {
    const layoutGap = window.innerHeight - document.documentElement.clientHeight
    if (layoutGap > 0) inset = Math.round(layoutGap)
  }
  return inset
}

function applyBrowserUiBottom() {
  document.documentElement.style.setProperty(VAR, `${readBrowserUiBottom()}px`)
}

/** 供弹窗 inline style 使用：safe-area + 浏览器底栏 */
export function layoutBottomInsetCss() {
  return 'calc(env(safe-area-inset-bottom, 0px) + var(--browser-ui-bottom, 0px))'
}

export function initBrowserUiInset() {
  applyBrowserUiBottom()

  window.visualViewport?.addEventListener('resize', applyBrowserUiBottom)
  window.visualViewport?.addEventListener('scroll', applyBrowserUiBottom)
  window.addEventListener('resize', applyBrowserUiBottom)
  window.addEventListener('orientationchange', () => {
    setTimeout(applyBrowserUiBottom, 120)
  })
}
