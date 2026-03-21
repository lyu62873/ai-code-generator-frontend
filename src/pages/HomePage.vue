<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage } from '@/api/appController'
import { getDeployUrl } from '@/config/env'
import AppCard from '@/components/AppCard.vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const userPrompt = ref('')
const creating = ref(false)

const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const featuredApps = ref<API.AppVO[]>([])
const featuredAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const setPrompt = (prompt: string) => {
  userPrompt.value = prompt
}

const createApp = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('Please enter an app description')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('Please login first')
    await router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const res = await addApp({
      initPrompt: userPrompt.value.trim(),
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('App created successfully')
      const appId = String(res.data.data)
      await router.push(`/app/chat/${appId}`)
    } else {
      message.error('Create failed: ' + res.data.message)
    }
  } catch (error) {
    console.error('Create app failed:', error)
    message.error('Create failed, please retry')
  } finally {
    creating.value = false
  }
}

const loadMyApps = async () => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  try {
    const res = await listMyAppVoByPage({
      pageNum: myAppsPage.current,
      pageSize: myAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('Load my apps failed:', error)
  }
}

const loadFeaturedApps = async () => {
  try {
    const res = await listGoodAppVoByPage({
      pageNum: featuredAppsPage.current,
      pageSize: featuredAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('Load featured apps failed:', error)
  }
}

const viewChat = (appId: string | number | undefined) => {
  if (appId) {
    router.push(`/app/chat/${appId}?view=1`)
  }
}

const viewWork = (app: API.AppVO) => {
  if (app.deployKey) {
    const url = getDeployUrl(app.deployKey)
    window.open(url, '_blank')
  }
}

onMounted(() => {
  loadMyApps()
  loadFeaturedApps()

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = (clientX / innerWidth) * 100
    const y = (clientY / innerHeight) * 100

    document.documentElement.style.setProperty('--mouse-x', `${x}%`)
    document.documentElement.style.setProperty('--mouse-y', `${y}%`)
  }

  document.addEventListener('mousemove', handleMouseMove)

  return () => {
    document.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<template>
  <div id="homePage">
    <div class="container">
      <div class="hero-section">
        <h1 class="hero-title">AI App Generation Platform</h1>
        <p class="hero-description">One Sentence, One Web</p>
      </div>

      <div class="input-section">
        <a-textarea
          v-model:value="userPrompt"
          placeholder="e.g. Create a personal blog site for me"
          :rows="4"
          :maxlength="1000"
          class="prompt-input"
        />
        <div class="input-actions">
          <a-button type="primary" size="large" @click="createApp" :loading="creating">
            <template #icon>
              <span>↑</span>
            </template>
          </a-button>
        </div>
      </div>

      <div class="quick-actions">
        <a-button
          type="default"
          @click="
            setPrompt(
              'Create a modern personal blog with post list, detail pages, categories, tags, search, comments and about page. Clean design, responsive layout, Markdown support, show latest and popular on homepage.',
            )
          "
          >Personal Blog</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              'Design a professional corporate site with company intro, products/services, news, contact. Business style, carousel, product cards, team, case studies, multi-language and live chat.',
            )
          "
          >Corporate Site</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              'Build a full e-commerce site: product catalog, cart, login/register, orders, checkout. Modern product cards, search/filter, reviews, coupons and loyalty points.',
            )
          "
          >Online Store</a-button
        >
        <a-button
          type="default"
          @click="
            setPrompt(
              'A portfolio site for designers, photographers, artists. Gallery, project details, resume, contact. Masonry or grid layout, image lightbox, category filter.',
            )
          "
          >Portfolio</a-button
        >
      </div>

      <div class="section">
        <h2 class="section-title">My Apps</h2>
        <div class="app-grid">
          <AppCard
            v-for="app in myApps"
            :key="app.id"
            :app="app"
            @view-chat="viewChat"
            @view-work="viewWork"
          />
        </div>
        <div class="pagination-wrapper">
          <a-pagination
            v-model:current="myAppsPage.current"
            v-model:page-size="myAppsPage.pageSize"
            :total="myAppsPage.total"
            :show-size-changer="false"
            :show-total="(total: number) => `${total} apps`"
            @change="loadMyApps"
          />
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Featured</h2>
        <div class="featured-grid">
          <AppCard
            v-for="app in featuredApps"
            :key="app.id"
            :app="app"
            :featured="true"
            :show-view-chat="false"
            @view-work="viewWork"
          />
        </div>
        <div class="pagination-wrapper">
          <a-pagination
            v-model:current="featuredAppsPage.current"
            v-model:page-size="featuredAppsPage.pageSize"
            :total="featuredAppsPage.total"
            :show-size-changer="false"
            :show-total="(total: number) => `${total} apps`"
            @change="loadFeaturedApps"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');

#homePage {
  --bg-top: #f8faff;
  --bg-mid: #eef3ff;
  --bg-bottom: #eaf5f2;
  --accent-primary: #6f7ee8;
  --accent-secondary: #8a7de6;
  --accent-tertiary: #5fb8a5;
  --text-primary: #2c3950;
  --text-secondary: #6f7f96;
  --surface: rgba(255, 255, 255, 0.82);
  --surface-strong: rgba(255, 255, 255, 0.92);
  --border-soft: rgba(111, 126, 232, 0.22);
  --shadow-soft: 0 12px 35px rgba(96, 115, 185, 0.16);
  --shadow-strong: 0 16px 40px rgba(96, 115, 185, 0.22);
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background:
    linear-gradient(180deg, var(--bg-top) 0%, var(--bg-mid) 35%, var(--bg-bottom) 100%),
    radial-gradient(circle at 20% 80%, rgba(111, 126, 232, 0.14) 0%, transparent 52%),
    radial-gradient(circle at 80% 20%, rgba(138, 125, 230, 0.12) 0%, transparent 52%),
    radial-gradient(circle at 40% 40%, rgba(95, 184, 165, 0.1) 0%, transparent 56%);
  position: relative;
  overflow: hidden;
}

#homePage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(111, 126, 232, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(111, 126, 232, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(138, 125, 230, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 125, 230, 0.03) 1px, transparent 1px);
  background-size:
    100px 100px,
    100px 100px,
    20px 20px,
    20px 20px;
  pointer-events: none;
  animation: gridFloat 20s ease-in-out infinite;
}

#homePage::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(111, 126, 232, 0.08) 0%,
      rgba(138, 125, 230, 0.06) 40%,
      transparent 80%
    ),
    linear-gradient(45deg, transparent 30%, rgba(111, 126, 232, 0.04) 50%, transparent 70%),
    linear-gradient(-45deg, transparent 30%, rgba(138, 125, 230, 0.04) 50%, transparent 70%);
  pointer-events: none;
  animation: lightPulse 8s ease-in-out infinite alternate;
}

@keyframes gridFloat {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(5px, 5px);
  }
}

@keyframes lightPulse {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.7;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

.hero-section {
  text-align: center;
  padding: 80px 0 60px;
  margin-bottom: 28px;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse 800px 400px at center, rgba(111, 126, 232, 0.12) 0%, transparent 70%),
    linear-gradient(45deg, transparent 30%, rgba(138, 125, 230, 0.05) 50%, transparent 70%),
    linear-gradient(-45deg, transparent 30%, rgba(95, 184, 165, 0.04) 50%, transparent 70%);
  animation: heroGlow 10s ease-in-out infinite alternate;
}

@keyframes heroGlow {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 20px;
  line-height: 1.2;
  background: linear-gradient(
    135deg,
    var(--accent-primary) 0%,
    var(--accent-secondary) 50%,
    var(--accent-tertiary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  letter-spacing: -1px;
  position: relative;
  z-index: 2;
  animation: titleShimmer 3s ease-in-out infinite;
}

@keyframes titleShimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-description {
  font-size: 20px;
  margin: 0;
  opacity: 0.8;
  color: var(--text-secondary);
  position: relative;
  z-index: 2;
}

.input-section {
  position: relative;
  margin: 0 auto 24px;
  max-width: 800px;
}

.prompt-input {
  border-radius: 16px;
  border: 1px solid var(--border-soft);
  font-size: 16px;
  padding: 20px 60px 20px 20px;
  background: var(--surface-strong);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-soft);
  transition: all 0.25s ease;
}

.prompt-input:focus {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(111, 126, 232, 0.35);
  box-shadow: var(--shadow-strong);
  transform: translateY(-2px);
}

.input-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.quick-actions .ant-btn {
  border-radius: 25px;
  padding: 8px 20px;
  height: auto;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
  backdrop-filter: blur(15px);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(96, 115, 185, 0.1);
}

.quick-actions .ant-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(111, 126, 232, 0.12), transparent);
  transition: left 0.5s;
}

.quick-actions .ant-btn:hover::before {
  left: 100%;
}

.quick-actions .ant-btn:hover {
  background: var(--surface-strong);
  border-color: rgba(111, 126, 232, 0.45);
  color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(111, 126, 232, 0.2);
}

.section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
  background: linear-gradient(
    135deg,
    var(--accent-primary) 0%,
    var(--accent-secondary) 50%,
    var(--accent-tertiary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: titleShimmer 3s ease-in-out infinite;
  text-align: center;
  letter-spacing: -0.5px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

:deep(.ant-pagination .ant-pagination-item) {
  border-color: rgba(111, 126, 232, 0.2);
  background: rgba(255, 255, 255, 0.78);
}

:deep(.ant-pagination .ant-pagination-item a) {
  color: var(--text-secondary);
}

:deep(.ant-pagination .ant-pagination-item-active) {
  border-color: rgba(111, 126, 232, 0.55);
  background: rgba(111, 126, 232, 0.1);
}

:deep(.ant-pagination .ant-pagination-item-active a) {
  color: var(--accent-primary);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-description {
    font-size: 16px;
  }

  .app-grid,
  .featured-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    justify-content: center;
  }
}
</style>
