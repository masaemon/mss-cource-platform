<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const thumbnailUrl = computed(() =>
  props.course.thumbnail_url || '/images/default-course.png'
)

const categoryName = computed(() =>
  props.course.category?.name_ja || 'カテゴリーなし'
)

const instructorName = computed(() =>
  props.course.instructor?.display_name || '講師名不明'
)

const videoCount = computed(() =>
  props.course.videos?.length || 0
)

function goToCourse() {
  router.push(`/courses/${props.course.id}`)
}
</script>

<template>
  <div
    class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
    @click="goToCourse"
  >
    <figure class="aspect-video">
      <img
        :src="thumbnailUrl"
        :alt="course.title_ja"
        class="w-full h-full object-cover"
      />
    </figure>

    <div class="card-body">
      <!-- カテゴリーバッジ -->
      <div class="badge badge-primary badge-sm">
        {{ categoryName }}
      </div>

      <!-- タイトル -->
      <h3 class="card-title text-lg line-clamp-2">
        {{ course.title_ja }}
      </h3>

      <!-- 説明 -->
      <p class="text-sm text-base-content/60 line-clamp-2">
        {{ course.description_ja }}
      </p>

      <!-- フッター -->
      <div class="card-actions justify-between items-center mt-4">
        <div class="flex items-center gap-2">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-full w-8">
              <span class="text-xs">{{ instructorName[0] }}</span>
            </div>
          </div>
          <span class="text-sm text-base-content/60">{{ instructorName }}</span>
        </div>

        <div class="badge badge-outline badge-sm">
          {{ videoCount }} 動画
        </div>
      </div>
    </div>
  </div>
</template>
