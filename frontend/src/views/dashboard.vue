<script setup lang="ts">
import { useApi } from '../composables/useApi'
import { onBeforeMount, ref } from 'vue'
import type { DashboardResponse } from '../composables/useApi'

const api = useApi()
const dashboard = ref<DashboardResponse>()

onBeforeMount(async () => {
    dashboard.value = await api.getDashboard()
})
</script>

<template>
  <div class="page">
    <h1>Dashboard</h1>
    <div class="dashboard-content">
        <div v-html="dashboard?.htmlComponents"></div>
    </div>
  </div>
</template>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}
</style>