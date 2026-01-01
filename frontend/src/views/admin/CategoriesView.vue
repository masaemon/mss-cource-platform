<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/categories'

const { success, error: showError } = useToast()

const categories = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingCategory = ref(null)

const formData = ref({
  name_ja: '',
  name_en: '',
  slug: ''
})

onMounted(async () => {
  await fetchCategories()
})

async function fetchCategories() {
  try {
    categories.value = await getCategories()
  } catch (err) {
    showError('カテゴリーの取得に失敗しました')
    console.error('Failed to fetch categories:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingCategory.value = null
  formData.value = { name_ja: '', name_en: '', slug: '' }
  showModal.value = true
}

function openEditModal(category) {
  editingCategory.value = category
  formData.value = {
    name_ja: category.name_ja,
    name_en: category.name_en || '',
    slug: category.slug
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, formData.value)
      success('カテゴリーを更新しました')
    } else {
      await createCategory(formData.value)
      success('カテゴリーを作成しました')
    }

    showModal.value = false
    await fetchCategories()
  } catch (err) {
    showError(editingCategory.value ? 'カテゴリーの更新に失敗しました' : 'カテゴリーの作成に失敗しました')
    console.error('Failed to save category:', err)
  }
}

async function handleDelete(category) {
  if (!confirm(`カテゴリー「${category.name_ja}」を削除しますか？\nこのカテゴリーに紐づくコースがある場合、削除できません。`)) {
    return
  }

  try {
    await deleteCategory(category.id)
    success('カテゴリーを削除しました')
    await fetchCategories()
  } catch (err) {
    showError('カテゴリーの削除に失敗しました')
    console.error('Failed to delete category:', err)
  }
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold">カテゴリー管理</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        新規カテゴリー作成
      </button>
    </div>

    <!-- ナビゲーション -->
    <div class="tabs tabs-boxed mb-8">
      <router-link to="/admin/dashboard" class="tab">
        ダッシュボード
      </router-link>
      <router-link to="/admin/users" class="tab">
        ユーザー管理
      </router-link>
      <router-link to="/admin/categories" class="tab tab-active">
        カテゴリー管理
      </router-link>
    </div>

    <!-- カテゴリー一覧 -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="categories.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto mb-4 text-base-content/30">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
      </svg>
      <p class="text-lg mb-4">まだカテゴリーが作成されていません</p>
      <button @click="openCreateModal" class="btn btn-primary">
        最初のカテゴリーを作成
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div class="card-body">
          <h3 class="card-title">{{ category.name_ja }}</h3>
          <p class="text-sm text-base-content/60">{{ category.name_en || '-' }}</p>
          <p class="text-xs text-base-content/40 font-mono">slug: {{ category.slug }}</p>

          <div class="card-actions justify-end mt-4">
            <button
              @click="openEditModal(category)"
              class="btn btn-sm btn-ghost"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              編集
            </button>
            <button
              @click="handleDelete(category)"
              class="btn btn-sm btn-error btn-outline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- モーダル -->
    <dialog :open="showModal" class="modal" @click.self="closeModal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ editingCategory ? 'カテゴリー編集' : '新規カテゴリー作成' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">名前（日本語）*</span>
            </label>
            <input
              v-model="formData.name_ja"
              type="text"
              class="input input-bordered"
              placeholder="プログラミング"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">名前（英語）</span>
            </label>
            <input
              v-model="formData.name_en"
              type="text"
              class="input input-bordered"
              placeholder="Programming"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">スラッグ*</span>
              <span class="label-text-alt">英小文字とハイフンのみ</span>
            </label>
            <input
              v-model="formData.slug"
              type="text"
              class="input input-bordered font-mono"
              placeholder="programming"
              pattern="[a-z0-9-]+"
              required
            />
            <label class="label">
              <span class="label-text-alt">例: programming, web-development</span>
            </label>
          </div>

          <div class="modal-action">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-ghost"
            >
              キャンセル
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingCategory ? '更新' : '作成' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal" type="button">close</button>
      </form>
    </dialog>
  </div>
</template>
