<template>
  <a-layout-header class="header">
    <a-row :wrap="false">
      <!-- Left: Logo and title -->
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="header-left">
            <img class="logo" src="@/assets/logo.png" alt="Logo" />
            <h1 class="site-title">App Generation</h1>
          </div>
        </RouterLink>
      </a-col>
      <!-- Center: Navigation menu -->
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :items="menuItems"
          @click="handleMenuClick"
        />
      </a-col>
      <!-- Right: User actions -->
      <a-col>
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="loginUserStore.loginUser.userAvatar">
                  {{ loginUserStore.loginUser.userName?.charAt(0) || 'U' }}
                </a-avatar>
                {{ loginUserStore.loginUser.userName ?? 'Guest' }}
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="goProfile">
                    <UserOutlined />
                    Profile
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    Logout
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">Login</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type MenuProps, message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { userLogout } from '@/api/userController.ts'
import { LogoutOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const router = useRouter()
// Currently selected menu key
const selectedKeys = ref<string[]>(['/'])
// Sync selected key with route
router.afterEach((to, from, next) => {
  selectedKeys.value = [to.path]
})

// Menu items config
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: 'Home',
    title: 'Home',
  },
  {
    key: '/admin/userManage',
    label: 'User Management',
    title: 'User Management',
  },
  {
    key: '/admin/appManage',
    label: 'App Management',
    title: 'App Management',
  },
  {
    key: 'others',
    label: h(
      'a',
      {
        href: 'https://github.com/lyu62873/ai-code-generator-frontend',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      'Github Link',
    ),
    title: 'Github Link',
  },
]

// Filter menu items by permission
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    const menuKey = menu?.key as string
    if (menuKey?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// Menu items to display (after filter)
const menuItems = computed<MenuProps['items']>(() => filterMenus(originItems))

// Handle menu click
const handleMenuClick: MenuProps['onClick'] = (e) => {
  const key = e.key as string
  selectedKeys.value = [key]
  if (key.startsWith('/')) {
    router.push(key)
  }
}

// Logout
const doLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: 'Not logged in',
    })
    message.success('Logged out successfully')
    await router.push('/user/login')
  } else {
    message.error('Logout failed: ' + res.data.message)
  }
}

const goProfile = async () => {
  await router.push('/user/profile')
}
</script>

<style scoped>
.header {
  background: #fff;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 48px;
  width: 48px;
}

.site-title {
  margin: 0;
  font-size: 18px;
  color: #1890ff;
}

.ant-menu-horizontal {
  border-bottom: none !important;
}
</style>
