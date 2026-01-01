<script setup>
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()

const toggleTheme = () => {
  const html = document.documentElement
  const currentTheme = html.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  html.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}
</script>

<template>
  <header class="navbar bg-base-100 shadow-lg">
    <div class="navbar-start">
      <!-- モバイルメニュー -->
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><router-link to="/">コース一覧</router-link></li>
          <li><router-link to="/categories">カテゴリー</router-link></li>
        </ul>
      </div>

      <!-- ロゴ -->
      <router-link to="/" class="btn btn-ghost text-xl">
        MSS Course
      </router-link>
    </div>

    <!-- デスクトップメニュー -->
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><router-link to="/">コース一覧</router-link></li>
        <li><router-link to="/categories">カテゴリー</router-link></li>
      </ul>
    </div>

    <div class="navbar-end gap-2">
      <!-- テーマ切り替え -->
      <button class="btn btn-ghost btn-circle" @click="toggleTheme">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <!-- 未認証時 -->
      <template v-if="!user">
        <router-link to="/auth/login" class="btn btn-ghost">ログイン</router-link>
        <router-link to="/auth/signup" class="btn btn-primary">サインアップ</router-link>
      </template>

      <!-- 認証済み時 -->
      <template v-else>
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
              <img :src="user.avatar_url || '/images/default-avatar.png'" alt="avatar" />
            </div>
          </label>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>{{ user.display_name || user.email }}</a></li>
            <li><router-link to="/profile">プロフィール</router-link></li>
            <li v-if="user.role === 'instructor' || user.role === 'admin'">
              <router-link to="/instructor/dashboard">講師ダッシュボード</router-link>
            </li>
            <li v-if="user.role === 'admin'">
              <router-link to="/admin/dashboard">管理者</router-link>
            </li>
            <li><a @click.prevent="logout">ログアウト</a></li>
          </ul>
        </div>
      </template>
    </div>
  </header>
</template>
