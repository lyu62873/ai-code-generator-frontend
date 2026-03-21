<template>
  <div id="appEditPage">
    <div class="page-header">
      <h1>Edit App</h1>
    </div>

    <div class="edit-container">
      <a-card title="Basic Info" :loading="loading">
        <a-form
          :model="formData"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
          ref="formRef"
        >
          <a-form-item label="App Name" name="appName">
            <a-input
              v-model:value="formData.appName"
              placeholder="Enter app name"
              :maxlength="50"
              show-count
            />
          </a-form-item>

          <a-form-item v-if="isAdmin" label="Priority" name="priority" extra="Range: 0-98">
            <a-input-number
              v-model:value="formData.priority"
              :min="0"
              :max="98"
              style="width: 200px"
            />
          </a-form-item>

          <a-form-item label="Initial Prompt" name="initPrompt">
            <a-textarea
              v-model:value="formData.initPrompt"
              placeholder="Initial prompt"
              :rows="4"
              :maxlength="1000"
              show-count
              disabled
            />
            <div class="form-tip">Initial prompt cannot be edited</div>
          </a-form-item>

          <a-form-item label="Gen Type" name="codeGenType">
            <a-input
              :value="formatCodeGenType(formData.codeGenType)"
              placeholder="Gen type"
              disabled
            />
            <div class="form-tip">Gen type cannot be edited</div>
          </a-form-item>

          <a-form-item v-if="formData.deployKey" label="Deploy Key" name="deployKey">
            <a-input v-model:value="formData.deployKey" placeholder="Deploy key" disabled />
            <div class="form-tip">Deploy key cannot be edited</div>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit" :loading="submitting">
                Save
              </a-button>
              <a-button @click="resetForm">Reset</a-button>
              <a-button type="link" @click="goToChat">Go to Chat</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card title="App Info" style="margin-top: 24px">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="App ID">
            {{ appInfo?.id }}
          </a-descriptions-item>
          <a-descriptions-item label="Creator">
            <UserInfo :user="appInfo?.user" size="small" />
          </a-descriptions-item>
          <a-descriptions-item label="Created">
            {{ formatTime(appInfo?.createTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="Updated">
            {{ formatTime(appInfo?.updateTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="Deployed">
            {{ appInfo?.deployedTime ? formatTime(appInfo.deployedTime) : 'Not deployed' }}
          </a-descriptions-item>
          <a-descriptions-item label="Link">
            <a-button v-if="appInfo?.deployKey" type="link" @click="openPreview" size="small">
              View Preview
            </a-button>
            <span v-else>Not deployed</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { getAppVoById, updateApp, updateAppByAdmin } from '@/api/appController'
import { formatCodeGenType } from '@/utils/codeGenTypes'
import { formatTime } from '@/utils/time'
import UserInfo from '@/components/UserInfo.vue'
import { getStaticPreviewUrl } from '@/config/env'
import type { FormInstance } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

const appInfo = ref<API.AppVO>()
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  appName: '',
  priority: 0,
  initPrompt: '',
  codeGenType: '',
  deployKey: '',
})

const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

const rules = {
  appName: [
    { required: true, message: 'Please enter app name', trigger: 'blur' },
    { min: 1, max: 50, message: 'App name 1-50 characters', trigger: 'blur' },
  ],
  priority: [{ type: 'number', min: 0, max: 98, message: 'Priority 0-98', trigger: 'blur' }],
}

const fetchAppInfo = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('App ID not found')
    router.push('/')
    return
  }

  loading.value = true
  try {
    const res = await getAppVoById({ id: id as unknown as number })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data

      if (!isAdmin.value && appInfo.value.userId !== loginUserStore.loginUser.id) {
        message.error('No permission to edit this app')
        router.push('/')
        return
      }

      formData.appName = appInfo.value.appName || ''
      formData.priority = appInfo.value.priority || 0
      formData.initPrompt = appInfo.value.initPrompt || ''
      formData.codeGenType = appInfo.value.codeGenType || ''
      formData.deployKey = appInfo.value.deployKey || ''
    } else {
      message.error('Failed to load app info')
      router.push('/')
    }
  } catch (error) {
    console.error('Fetch app info failed:', error)
    message.error('Failed to load app info')
    router.push('/')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!appInfo.value?.id) return

  submitting.value = true
  try {
    let res
    if (isAdmin.value) {
      res = await updateAppByAdmin({
        id: appInfo.value.id,
        appName: formData.appName,
        priority: formData.priority,
      })
    } else {
      res = await updateApp({
        id: appInfo.value.id,
        appName: formData.appName,
      })
    }

    if (res.data.code === 0) {
      message.success('Saved')
      await fetchAppInfo()
    } else {
      message.error('Save failed: ' + res.data.message)
    }
  } catch (error) {
    console.error('Save failed:', error)
    message.error('Save failed')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (appInfo.value) {
    formData.appName = appInfo.value.appName || ''
    formData.priority = appInfo.value.priority || 0
  }
  formRef.value?.clearValidate()
}

const goToChat = () => {
  if (appInfo.value?.id) {
    router.push(`/app/chat/${appInfo.value.id}`)
  }
}

const openPreview = () => {
  if (appInfo.value?.codeGenType && appInfo.value?.id) {
    const url = getStaticPreviewUrl(appInfo.value.codeGenType, String(appInfo.value.id))
    window.open(url, '_blank')
  }
}

onMounted(() => {
  fetchAppInfo()
})
</script>

<style scoped>
#appEditPage {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.edit-container {
  border-radius: 8px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

:deep(.ant-card-head) {
  background: #fafafa;
}

:deep(.ant-descriptions-item-label) {
  background: #fafafa;
  font-weight: 500;
}
</style>
