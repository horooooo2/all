<template>
  <div v-if="section === 'banner'" class="banner-wrapper">
    <SkeletonBlock custom-class="banner-skeleton" />
  </div>

  <div v-else-if="section === 'notice'" class="announcement announcement--skeleton">
    <SkeletonBlock custom-class="notice-icon-skeleton" />
    <SkeletonBlock custom-class="notice-bar-skeleton" />
  </div>

  <div v-else-if="section === 'games'" class="game-section">
    <div class="game-grid">
      <SkeletonBlock
        v-for="i in 4"
        :key="i"
        custom-class="game-card-skeleton"
      />
    </div>
  </div>

  <div v-else-if="section === 'category'" class="game-category">
    <div class="category-grid">
      <SkeletonBlock
        v-for="i in 6"
        :key="i"
        custom-class="category-item-skeleton"
      />
    </div>
  </div>

  <div v-else-if="section === 'winners'" class="recent-winners-section">
    <div class="section-label">
      <SkeletonBlock custom-class="section-label-skeleton" />
    </div>
    <div class="winners-card">
      <SkeletonBlock custom-class="bonus-header-skeleton" />
      <SkeletonBlock
        v-for="i in 4"
        :key="i"
        custom-class="list-item-skeleton"
      />
    </div>
  </div>

  <div v-else-if="section === 'community'" class="community-section">
    <div class="section-label">
      <SkeletonBlock custom-class="section-label-skeleton" />
    </div>
    <div class="community-scroll">
      <SkeletonBlock
        v-for="i in 5"
        :key="i"
        custom-class="community-item-skeleton"
      />
    </div>
  </div>

  <div v-else-if="section === 'partners'" class="partners-section">
    <div class="section-label">
      <SkeletonBlock custom-class="section-label-skeleton section-label-skeleton--sm" />
    </div>
    <div class="partners-grid">
      <SkeletonBlock
        v-for="i in 6"
        :key="i"
        custom-class="partner-item-skeleton"
      />
    </div>
  </div>

  <div v-else-if="section === 'footer-links'" class="footer-section footer-section--skeleton">
    <SkeletonBlock custom-class="footer-label-skeleton" />
    <SkeletonBlock custom-class="footer-links-skeleton" />
    <SkeletonBlock custom-class="footer-name-skeleton" />
    <SkeletonBlock custom-class="footer-desc-skeleton" />
    <SkeletonBlock custom-class="footer-desc-skeleton footer-desc-skeleton--short" />
  </div>
</template>

<script setup>
import SkeletonBlock from '@/components/SkeletonBlock.vue'

defineProps({
  section: {
    type: String,
    required: true
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/skeleton.less';
@import '@/styles/pages/home.less';

.announcement--skeleton {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.footer-section--skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
</style>
