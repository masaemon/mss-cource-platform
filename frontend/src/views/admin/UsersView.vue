<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { getUsers, updateUserRole } from '@/api/users'

const { success, error: showError } = useToast()

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.email.toLowerCase().includes(query) ||
    user.display_name?.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  try {
    users.value = await getUsers()
  } catch (err) {
    showError('ユーザーの取得に失敗しました')
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
})

async function handleRoleChange(user, newRole) {
  if (!confirm(`${user.email} の役割を ${getRoleLabel(newRole)} に変更しますか？`)) {
    return
  }

  try {
    await updateUserRole(user.id, newRole)
    user.role = newRole
    success(`役割を ${getRoleLabel(newRole)} に変更しました`)
  } catch (err) {
    showError('役割の変更に失敗しました')
    console.error('Failed to update role:', err)
  }
}

function getRoleBadgeClass(role) {
  switch (role) {
    case 'admin': return 'badge-error'
    case 'instructor': return 'badge-warning'
    default: return 'badge-ghost'
  }
}

function getRoleLabel(role) {
  switch (role) {
    case 'admin': return '管理者'
    case 'instructor': return '講師'
    default: return '一般ユーザー'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">ユーザー管理</h1>

    <!-- ナビゲーション -->
    <div class="tabs tabs-boxed mb-8">
      <router-link to="/admin/dashboard" class="tab">
        ダッシュボード
      </router-link>
      <router-link to="/admin/users" class="tab tab-active">
        ユーザー管理
      </router-link>
      <router-link to="/admin/categories" class="tab">
        カテゴリー管理
      </router-link>
    </div>

    <!-- 検索 -->
    <div class="form-control mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="メールアドレスまたは表示名で検索..."
        class="input input-bordered"
      />
    </div>

    <!-- ユーザー一覧 -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>メールアドレス</th>
            <th>表示名</th>
            <th>役割</th>
            <th>登録日</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.email }}</td>
            <td>{{ user.display_name || '-' }}</td>
            <td>
              <div :class="['badge', getRoleBadgeClass(user.role)]">
                {{ getRoleLabel(user.role) }}
              </div>
            </td>
            <td>{{ new Date(user.created_at).toLocaleDateString('ja-JP') }}</td>
            <td>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-xs">
                  変更
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-10">
                  <li v-if="user.role !== 'user'">
                    <a @click="handleRoleChange(user, 'user')">一般ユーザー</a>
                  </li>
                  <li v-if="user.role !== 'instructor'">
                    <a @click="handleRoleChange(user, 'instructor')">講師</a>
                  </li>
                  <li v-if="user.role !== 'admin'">
                    <a @click="handleRoleChange(user, 'admin')">管理者</a>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-sm text-base-content/60">
      {{ filteredUsers.length }}人のユーザー
      <span v-if="searchQuery">(検索結果)</span>
    </div>
  </div>
</template>
