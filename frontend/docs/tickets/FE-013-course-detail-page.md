# FE-013: コース詳細ページ実装

## 概要

コース詳細ページを実装し、動画リスト、講師情報、コース説明を表示します。

## 優先度

**High**

## 推定時間

3時間

## 依存関係

- FE-011: コースAPIクライアント実装
- FE-012: コース一覧ページ実装

## 実装内容

### 1. CourseDetailView.vue ページ

`src/views/CourseDetailView.vue`:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const authStore = useAuthStore()

const courseId = route.params.id
const loading = ref(true)
const error = ref(null)

const course = computed(() => courseStore.currentCourse)

const isInstructor = computed(() =>
  authStore.isInstructor &&
  course.value?.instructor_id === authStore.user?.id
)

const thumbnailUrl = computed(() =>
  course.value?.thumbnail_url || '/images/default-course.png'
)

const videoCount = computed(() =>
  course.value?.videos?.length || 0
)

onMounted(async () => {
  try {
    await courseStore.fetchCourse(courseId)
  } catch (err) {
    error.value = err.response?.data?.detail || 'コースの取得に失敗しました'
  } finally {
    loading.value = false
  }
})

function goToEditCourse() {
  router.push(`/instructor/courses/${courseId}/edit`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- ローディング -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- エラー -->
    <div v-else-if="error" class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- コース詳細 -->
    <div v-else-if="course">
      <!-- ヘッダー -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="breadcrumbs text-sm mb-2">
            <ul>
              <li><router-link to="/">ホーム</router-link></li>
              <li>{{ course.title_ja }}</li>
            </ul>
          </div>
          <h1 class="text-4xl font-bold">{{ course.title_ja }}</h1>
        </div>

        <!-- 講師用編集ボタン -->
        <button
          v-if="isInstructor"
          @click="goToEditCourse"
          class="btn btn-outline btn-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          編集
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- メインコンテンツ -->
        <div class="lg:col-span-2">
          <!-- サムネイル -->
          <figure class="aspect-video mb-6 rounded-lg overflow-hidden">
            <img
              :src="thumbnailUrl"
              :alt="course.title_ja"
              class="w-full h-full object-cover"
            />
          </figure>

          <!-- タブ -->
          <div role="tablist" class="tabs tabs-lifted">
            <input
              type="radio"
              name="course_tabs"
              role="tab"
              class="tab"
              aria-label="概要"
              checked
            />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <h2 class="text-2xl font-bold mb-4">コース概要</h2>
              <p class="text-base-content/80 whitespace-pre-wrap">
                {{ course.description_ja }}
              </p>

              <!-- カテゴリー -->
              <div class="mt-6">
                <h3 class="text-lg font-semibold mb-2">カテゴリー</h3>
                <div class="badge badge-primary">
                  {{ course.category?.name_ja }}
                </div>
              </div>

              <!-- 統計 -->
              <div class="stats shadow mt-6 w-full">
                <div class="stat">
                  <div class="stat-title">動画数</div>
                  <div class="stat-value text-primary">{{ videoCount }}</div>
                  <div class="stat-desc">本のレッスン</div>
                </div>

                <div class="stat">
                  <div class="stat-title">公開状態</div>
                  <div class="stat-value text-sm">
                    {{ course.is_published ? '公開中' : '非公開' }}
                  </div>
                </div>
              </div>
            </div>

            <input
              type="radio"
              name="course_tabs"
              role="tab"
              class="tab"
              aria-label="動画"
            />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <h2 class="text-2xl font-bold mb-4">レッスン動画</h2>

              <!-- 動画リスト -->
              <div v-if="course.videos && course.videos.length > 0" class="space-y-3">
                <div
                  v-for="(video, index) in course.videos"
                  :key="video.id"
                  class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                >
                  <div class="card-body p-4">
                    <div class="flex items-center gap-4">
                      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold">
                        {{ index + 1 }}
                      </div>
                      <div class="flex-1">
                        <h4 class="font-medium">{{ video.title_ja }}</h4>
                        <p class="text-sm text-base-content/60 line-clamp-1">
                          {{ video.description_ja }}
                        </p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 動画なし -->
              <div v-else class="text-center py-8 text-base-content/60">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                </svg>
                <p>動画がまだ追加されていません</p>
              </div>
            </div>
          </div>
        </div>

        <!-- サイドバー -->
        <div class="lg:col-span-1">
          <!-- 講師情報カード -->
          <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
              <h3 class="card-title text-lg mb-4">講師</h3>

              <div class="flex items-center gap-3 mb-4">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-12">
                    <span class="text-lg">
                      {{ course.instructor?.display_name?.[0] || '?' }}
                    </span>
                  </div>
                </div>
                <div>
                  <p class="font-semibold">
                    {{ course.instructor?.display_name || '講師名不明' }}
                  </p>
                  <p class="text-sm text-base-content/60">
                    {{ course.instructor?.email }}
                  </p>
                </div>
              </div>

              <div v-if="course.instructor?.bio" class="divider my-2"></div>

              <p v-if="course.instructor?.bio" class="text-sm text-base-content/70">
                {{ course.instructor.bio }}
              </p>
            </div>
          </div>

          <!-- アクションカード -->
          <div class="card bg-primary text-primary-content shadow-xl">
            <div class="card-body">
              <h3 class="card-title">学習を始めましょう</h3>
              <p class="text-sm opacity-80">
                {{ videoCount }}本の動画で構成されています
              </p>
              <div class="card-actions justify-end mt-4">
                <button class="btn btn-secondary w-full">
                  最初の動画を見る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. Router 更新

`src/router/index.js` にコース詳細ルートを追加:

```javascript
import CourseDetailView from '@/views/CourseDetailView.vue'

const routes = [
  // ... 既存のルート
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: CourseDetailView,
    meta: {
      title: 'コース詳細'
    }
  }
]
```

## 実装ファイル

- `frontend/src/views/CourseDetailView.vue` (新規作成)
- `frontend/src/router/index.js` (更新)

## 検証方法

```bash
npm run dev
# コース一覧からコースをクリック、または
# http://localhost:5173/courses/{course-id} にアクセス
```

以下を確認:
- [ ] コース詳細が表示される
- [ ] サムネイル画像が表示される
- [ ] 講師情報が表示される
- [ ] 動画リストが表示される
- [ ] タブ切り替えが動作する
- [ ] パンくずリストが表示される
- [ ] 講師の場合は編集ボタンが表示される
- [ ] ローディング・エラー状態が適切に表示される

## 完了条件

- [ ] コース詳細ページが実装されている
- [ ] コース情報が正しく表示される
- [ ] 動画リストが表示される
- [ ] 講師情報が表示される
- [ ] タブナビゲーションが動作する
- [ ] レスポンシブデザインが動作する

## 備考

### レイアウト

- デスクトップ: 2カラム（メイン2/3、サイドバー1/3）
- モバイル: 1カラム

### 今後の拡張

- 動画クリックでプレイヤー表示（FE-014で実装）
- 視聴進捗表示（FE-015で実装）
- コメントセクション（FE-020で実装）
- 関連コース表示
