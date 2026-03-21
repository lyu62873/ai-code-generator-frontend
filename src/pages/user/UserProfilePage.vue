<template>
  <div id="userProfilePage">
    <a-card title="My Profile" :loading="loading">
      <a-form layout="vertical" :model="formState" @finish="handleSubmit">
        <a-form-item
          label="User Name"
          name="userName"
          :rules="[{ required: true, message: 'Please enter your user name' }]"
        >
          <a-input v-model:value="formState.userName" placeholder="Enter your user name" />
        </a-form-item>

        <a-form-item label="Profile" name="userProfile">
          <a-textarea
            v-model:value="formState.userProfile"
            :rows="4"
            :maxlength="300"
            show-count
            placeholder="Tell us about yourself"
          />
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting">Save</a-button>
          <a-button @click="resetForm">Reset</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-card title="Change Password" class="password-card">
      <a-form layout="vertical" :model="passwordForm" @finish="handlePasswordSubmit">
        <a-form-item
          label="Old Password"
          name="oldPassword"
          :rules="[{ required: true, message: 'Please enter old password' }]"
        >
          <a-input-password
            v-model:value="passwordForm.oldPassword"
            placeholder="Enter old password"
          />
        </a-form-item>

        <a-form-item
          label="New Password"
          name="newPassword"
          :rules="[
            { required: true, message: 'Please enter new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]"
        >
          <a-input-password
            v-model:value="passwordForm.newPassword"
            placeholder="Enter new password"
          />
        </a-form-item>

        <a-form-item
          label="Confirm New Password"
          name="checkPassword"
          :rules="[
            { required: true, message: 'Please confirm new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]"
        >
          <a-input-password
            v-model:value="passwordForm.checkPassword"
            placeholder="Confirm new password"
          />
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit" :loading="changingPassword">
            Update Password
          </a-button>
          <a-button @click="resetPasswordForm">Reset</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { updateMyPassword, updateMyUser } from '@/api/userController'
import { useRouter } from 'vue-router'

const loginUserStore = useLoginUserStore()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const changingPassword = ref(false)

const formState = reactive<API.UserSelfUpdateRequest>({
  userName: '',
  userProfile: '',
})

const passwordForm = reactive<API.UserUpdatePasswordRequest>({
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

const fillForm = () => {
  const loginUser = loginUserStore.loginUser
  formState.userName = loginUser.userName || ''
  formState.userProfile = loginUser.userProfile || ''
}

const loadLoginUser = async () => {
  loading.value = true
  try {
    await loginUserStore.fetchLoginUser()
    if (!loginUserStore.loginUser.id) {
      message.warning('Please login first')
      await router.push('/user/login')
      return
    }
    fillForm()
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const res = await updateMyUser({
      userName: formState.userName,
      userProfile: formState.userProfile,
    })
    if (res.data.code === 0) {
      message.success('Profile updated')
      await loginUserStore.fetchLoginUser()
      fillForm()
      return
    }
    message.error('Update failed: ' + res.data.message)
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || error?.message || ''
    if (String(errMsg).toLowerCase().includes('auth') || String(errMsg).toLowerCase().includes('permission')) {
      message.error('Current backend only allows admin to update user')
      return
    }
    message.error('Update failed')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  fillForm()
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.checkPassword = ''
}

const handlePasswordSubmit = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.checkPassword) {
    message.warning('Please complete all password fields')
    return
  }
  if (passwordForm.newPassword.length < 8) {
    message.warning('New password must be at least 8 characters')
    return
  }
  if (passwordForm.newPassword !== passwordForm.checkPassword) {
    message.warning('New passwords do not match')
    return
  }
  changingPassword.value = true
  try {
    const res = await updateMyPassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      checkPassword: passwordForm.checkPassword,
    })
    if (res.data.code === 0) {
      message.success('Password changed successfully. Please log in again.')
      resetPasswordForm()
      loginUserStore.setLoginUser({ userName: 'Not logged in' })
      await router.push('/user/login')
      return
    }
    message.error('Password update failed: ' + res.data.message)
  } catch {
    message.error('Password update failed')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadLoginUser()
})
</script>

<style scoped>
#userProfilePage {
  max-width: 720px;
  margin: 24px auto;
}

.password-card {
  margin-top: 16px;
}
</style>
