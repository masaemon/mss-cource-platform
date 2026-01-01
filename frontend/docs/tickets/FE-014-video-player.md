# FE-014: 動画プレイヤーコンポーネント実装

## 概要

YouTube IFrame API を使用した動画プレイヤーコンポーネントを実装します。

## 優先度

**High**

## 推定時間

2.5時間

## 依存関係

- FE-013: コース詳細ページ実装

## 実装内容

### 1. YouTube IFrame API スクリプトローダー

`src/utils/youtube.js`:

```javascript
/**
 * YouTube IFrame API をロードする
 * @returns {Promise<void>}
 */
export function loadYouTubeAPI() {
  return new Promise((resolve) => {
    // すでにロード済みの場合
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    // ロード中の場合
    if (window.YT) {
      const checkInterval = setInterval(() => {
        if (window.YT.Player) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      return
    }

    // 初回ロード
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })
}

/**
 * YouTube URL から動画IDを抽出する
 * @param {string} url - YouTube URL
 * @returns {string|null} 動画ID
 */
export function extractYouTubeVideoId(url) {
  if (!url) return null

  // すでにIDのみの場合
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  // 標準URL: https://www.youtube.com/watch?v=VIDEO_ID
  const standardMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (standardMatch) {
    return standardMatch[1]
  }

  // 短縮URL: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) {
    return shortMatch[1]
  }

  // 埋め込みURL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) {
    return embedMatch[1]
  }

  return null
}
```

### 2. VideoPlayer.vue コンポーネント

`src/components/course/VideoPlayer.vue`:

```vue
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { loadYouTubeAPI, extractYouTubeVideoId } from '@/utils/youtube'

const props = defineProps({
  video: {
    type: Object,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'ready',
  'playing',
  'paused',
  'ended',
  'error'
])

const playerRef = ref(null)
const player = ref(null)
const playerReady = ref(false)
const playerState = ref(null)
const error = ref(null)

const videoId = ref(null)

// 動画IDを抽出
watch(() => props.video, (newVideo) => {
  if (newVideo) {
    videoId.value = extractYouTubeVideoId(newVideo.youtube_video_id || newVideo.youtube_url)
    if (videoId.value && playerReady.value) {
      loadVideo()
    }
  }
}, { immediate: true })

async function initPlayer() {
  try {
    await loadYouTubeAPI()

    if (!videoId.value) {
      throw new Error('Invalid video ID')
    }

    player.value = new window.YT.Player(playerRef.value, {
      videoId: videoId.value,
      playerVars: {
        autoplay: props.autoplay ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        fs: 1,
        playsinline: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    })
  } catch (err) {
    error.value = err.message
    emit('error', err)
  }
}

function onPlayerReady(event) {
  playerReady.value = true
  emit('ready', event)
}

function onPlayerStateChange(event) {
  playerState.value = event.data

  switch (event.data) {
    case window.YT.PlayerState.PLAYING:
      emit('playing')
      break
    case window.YT.PlayerState.PAUSED:
      emit('paused')
      break
    case window.YT.PlayerState.ENDED:
      emit('ended')
      break
  }
}

function onPlayerError(event) {
  const errorMessages = {
    2: '無効なパラメータです',
    5: 'HTML5 プレイヤーのエラーです',
    100: '動画が見つかりません',
    101: '埋め込みが許可されていません',
    150: '埋め込みが許可されていません'
  }

  error.value = errorMessages[event.data] || '動画の読み込みに失敗しました'
  emit('error', { code: event.data, message: error.value })
}

function loadVideo() {
  if (player.value && videoId.value) {
    player.value.loadVideoById(videoId.value)
  }
}

// 公開メソッド
function play() {
  if (player.value) {
    player.value.playVideo()
  }
}

function pause() {
  if (player.value) {
    player.value.pauseVideo()
  }
}

function stop() {
  if (player.value) {
    player.value.stopVideo()
  }
}

function getCurrentTime() {
  return player.value ? player.value.getCurrentTime() : 0
}

function getDuration() {
  return player.value ? player.value.getDuration() : 0
}

function seekTo(seconds) {
  if (player.value) {
    player.value.seekTo(seconds, true)
  }
}

// ライフサイクル
onMounted(() => {
  initPlayer()
})

onUnmounted(() => {
  if (player.value && player.value.destroy) {
    player.value.destroy()
  }
})

// 公開メソッドを expose
defineExpose({
  play,
  pause,
  stop,
  getCurrentTime,
  getDuration,
  seekTo
})
</script>

<template>
  <div class="video-player">
    <!-- エラー表示 -->
    <div v-if="error" class="alert alert-error mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- 動画タイトル -->
    <div class="mb-4">
      <h2 class="text-2xl font-bold">{{ video.title_ja }}</h2>
      <p v-if="video.description_ja" class="text-base-content/60 mt-2">
        {{ video.description_ja }}
      </p>
    </div>

    <!-- プレイヤー -->
    <div class="aspect-video bg-black rounded-lg overflow-hidden">
      <div ref="playerRef" class="w-full h-full"></div>
    </div>

    <!-- プレイヤー状態表示（開発用） -->
    <div v-if="import.meta.env.DEV" class="mt-2 text-sm text-base-content/60">
      Status: {{ playerState !== null ? ['unstarted', 'ended', 'playing', 'paused', 'buffering', 'cued'][playerState + 1] : 'loading' }}
    </div>
  </div>
</template>

<style scoped>
.video-player {
  width: 100%;
}
</style>
```

### 3. CourseDetailView.vue 更新

`src/views/CourseDetailView.vue` に動画プレイヤーを統合:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import VideoPlayer from '@/components/course/VideoPlayer.vue'

// ... 既存のコード

const selectedVideo = ref(null)

function selectVideo(video) {
  selectedVideo.value = video
}

function handleVideoEnded() {
  // 次の動画を自動再生（オプション）
  const currentIndex = course.value.videos.findIndex(v => v.id === selectedVideo.value.id)
  if (currentIndex < course.value.videos.length - 1) {
    selectedVideo.value = course.value.videos[currentIndex + 1]
  }
}

onMounted(async () => {
  try {
    await courseStore.fetchCourse(courseId)
    // 最初の動画を選択
    if (course.value?.videos?.length > 0) {
      selectedVideo.value = course.value.videos[0]
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'コースの取得に失敗しました'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <!-- ... 既存のコード -->

  <!-- 動画プレイヤーセクション（動画が選択されている場合） -->
  <div v-if="selectedVideo" class="mb-6">
    <VideoPlayer
      :video="selectedVideo"
      @ended="handleVideoEnded"
    />
  </div>

  <!-- サムネイル（動画が選択されていない場合のみ表示） -->
  <figure v-else class="aspect-video mb-6 rounded-lg overflow-hidden">
    <!-- ... 既存のコード -->
  </figure>

  <!-- 動画リスト更新 -->
  <div
    v-for="(video, index) in course.videos"
    :key="video.id"
    class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
    :class="{ 'ring-2 ring-primary': selectedVideo?.id === video.id }"
    @click="selectVideo(video)"
  >
    <!-- ... 既存のコード -->
  </div>
</template>
```

## 実装ファイル

- `frontend/src/utils/youtube.js` (新規作成)
- `frontend/src/components/course/VideoPlayer.vue` (新規作成)
- `frontend/src/views/CourseDetailView.vue` (更新)

## 検証方法

```bash
npm run dev
# コース詳細ページで動画をクリック
```

以下を確認:
- [ ] YouTube IFrame API が正しくロードされる
- [ ] 動画が埋め込まれて再生される
- [ ] 動画の切り替えが動作する
- [ ] エラーメッセージが適切に表示される
- [ ] 再生終了時に次の動画に移動する
- [ ] レスポンシブデザインが動作する

## 完了条件

- [ ] YouTube API ローダーが実装されている
- [ ] VideoPlayer コンポーネントが実装されている
- [ ] 動画の再生・停止が動作する
- [ ] 動画の切り替えが動作する
- [ ] エラーハンドリングが実装されている
- [ ] イベント通知が動作する

## 備考

### YouTube IFrame API

- プライバシーモードは不要（analytics必要）
- `rel=0` で関連動画を制限
- `modestbranding=1` でYouTubeロゴを最小化

### セキュリティ

- CSP (Content Security Policy) で `youtube.com` を許可
- `youtube_video_id` のバリデーション

### パフォーマンス

- API は1回のみロード（シングルトンパターン）
- コンポーネント破棄時にプレイヤーを破棄

### 今後の拡張

- 視聴進捗の記録（FE-015で実装）
- 再生速度変更
- 字幕サポート
- プレイリスト自動再生
