import { useCourseStore } from '@/stores/course'
import { storeToRefs } from 'pinia'

export function useCourses() {
  const courseStore = useCourseStore()

  const {
    courses,
    currentCourse,
    loading,
    error,
    totalCourses,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    selectedCategory,
    searchQuery,
    sortBy
  } = storeToRefs(courseStore)

  return {
    // State
    courses,
    currentCourse,
    loading,
    error,
    totalCourses,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    selectedCategory,
    searchQuery,
    sortBy,

    // Actions
    fetchCourses: courseStore.fetchCourses,
    fetchCourse: courseStore.fetchCourse,
    createCourse: courseStore.createCourse,
    updateCourse: courseStore.updateCourse,
    deleteCourse: courseStore.deleteCourse,
    setPage: courseStore.setPage,
    nextPage: courseStore.nextPage,
    prevPage: courseStore.prevPage,
    setCategory: courseStore.setCategory,
    setSearch: courseStore.setSearch,
    setSort: courseStore.setSort,
    clearFilters: courseStore.clearFilters
  }
}
