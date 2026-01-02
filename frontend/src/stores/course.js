import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCourses as apiGetCourses,
  getCourse as apiGetCourse,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse
} from '@/api/courses'

export const useCourseStore = defineStore('course', () => {
  // State
  const courses = ref([])
  const currentCourse = ref(null)
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const totalCourses = ref(0)
  const currentPage = ref(1)
  const limit = ref(12)

  // Filters
  const selectedCategory = ref(null)
  const searchQuery = ref('')
  const sortBy = ref('created_at_desc')

  // Getters
  const totalPages = computed(() => Math.ceil(totalCourses.value / limit.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  // Actions
  async function fetchCourses(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await apiGetCourses({
        category_id: selectedCategory.value,
        search: searchQuery.value,
        page: currentPage.value,
        limit: limit.value,
        sort: sortBy.value,
        ...params
      })

      console.log('fetchCourses response:', response)

      // レスポンスが配列かオブジェクトかを判定
      if (Array.isArray(response)) {
        courses.value = response
        totalCourses.value = response.length
      } else if (response && response.data) {
        // APIレスポンスが {data: [...], total: N} の形式の場合
        courses.value = Array.isArray(response.data) ? response.data : []
        totalCourses.value = response.total || courses.value.length
      } else {
        courses.value = Array.isArray(response.courses) ? response.courses : []
        totalCourses.value = response.total || courses.value.length
      }

      console.log('courses.value:', courses.value)
      console.log('totalCourses:', totalCourses.value)

      return response
    } catch (err) {
      console.error('fetchCourses error:', err)
      error.value = err.response?.data?.detail || 'コースの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCourse(id) {
    loading.value = true
    error.value = null

    try {
      const course = await apiGetCourse(id)
      console.log('fetchCourse response:', course)
      console.log('Videos in course:', course.videos)
      currentCourse.value = course
      return course
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCourse(data) {
    loading.value = true
    error.value = null

    try {
      const course = await apiCreateCourse(data)

      // courses.valueが配列でない場合は初期化
      if (!Array.isArray(courses.value)) {
        courses.value = []
      }

      courses.value.unshift(course)
      return course
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの作成に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCourse(id, data) {
    loading.value = true
    error.value = null

    try {
      const course = await apiUpdateCourse(id, data)

      // ストア内のコースを更新
      const index = courses.value.findIndex(c => c.id === id)
      if (index !== -1) {
        courses.value[index] = course
      }

      if (currentCourse.value?.id === id) {
        currentCourse.value = course
      }

      return course
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの更新に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCourse(id) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteCourse(id)

      // ストアから削除
      courses.value = courses.value.filter(c => c.id !== id)

      if (currentCourse.value?.id === id) {
        currentCourse.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの削除に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Pagination
  function setPage(page) {
    currentPage.value = page
    fetchCourses()
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
      fetchCourses()
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
      fetchCourses()
    }
  }

  // Filters
  function setCategory(categoryId) {
    selectedCategory.value = categoryId
    currentPage.value = 1
    fetchCourses()
  }

  function setSearch(query) {
    searchQuery.value = query
    currentPage.value = 1
    fetchCourses()
  }

  function setSort(sort) {
    sortBy.value = sort
    currentPage.value = 1
    fetchCourses()
  }

  function clearFilters() {
    selectedCategory.value = null
    searchQuery.value = ''
    sortBy.value = 'created_at_desc'
    currentPage.value = 1
    fetchCourses()
  }

  return {
    // State
    courses,
    currentCourse,
    categories,
    loading,
    error,
    totalCourses,
    currentPage,
    limit,
    selectedCategory,
    searchQuery,
    sortBy,

    // Getters
    totalPages,
    hasNextPage,
    hasPrevPage,

    // Actions
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    setPage,
    nextPage,
    prevPage,
    setCategory,
    setSearch,
    setSort,
    clearFilters
  }
})
