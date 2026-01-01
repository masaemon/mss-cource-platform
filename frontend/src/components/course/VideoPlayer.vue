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
