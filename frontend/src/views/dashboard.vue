<script setup lang="ts">
import { useApi } from '../composables/useApi'
import { ref } from 'vue'
import type { DashboardResponse } from '../composables/useApi'
import { ROLES } from '../const'

const api = useApi()
const dashboard = ref<DashboardResponse>()
const loading = ref(false)

const selectedRole = ref<keyof typeof ROLES>('investor')
const searchQuery = ref('')

const loadDashboard = async () => {
  loading.value = true
  try {
    // TODO: Передать роль и запрос в API
    console.log('Loading dashboard for role:', selectedRole.value, 'Query:', searchQuery.value)
    dashboard.value = await api.getDashboard({
      role: selectedRole.value,
      query: searchQuery.value,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1>📊 IT-Пульс Татарстана</h1>
    
    <!-- Начальное состояние: кнопка -->
    <div v-if="!dashboard && !loading" class="initial-state">
      <p class="subtitle">Аналитика IT-компаний региона</p>
      
      <div class="filters-container">
        <div class="input-group">
          <label>Кто я?</label>
          <select v-model="selectedRole" class="role-select">
            <option v-for="(label, key) in ROLES" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="input-group">
          <label>Дополнительный фокус (опционально)</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Например: стартапы в Иннополисе"
            class="search-input"
          >
        </div>
      </div>

      <button class="load-btn" @click="loadDashboard">
        🚀 Сформировать отчет
      </button>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p class="loading-text">Анализируем данные для {{ ROLES[selectedRole] }}...</p>
      <p class="loading-subtext">Это может занять несколько секунд</p>
    </div>

    <!-- Результат -->
    <div v-if="dashboard && !loading" class="dashboard-content">
      <div v-html="dashboard.htmlComponents"></div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #deff00 0%, #00d900 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(222, 255, 0, 0.3);
}

/* Initial State */
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.role-select, .search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  outline: none;
}

.role-select:focus, .search-input:focus {
  border-color: #deff00;
  box-shadow: 0 0 15px rgba(222, 255, 0, 0.1);
}

.load-btn {
  width: 100%;
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #deff00 0%, #00d900 100%);
  color: #000;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(222, 255, 0, 0.4), 0 0 30px rgba(0, 217, 0, 0.2);
}

.load-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(222, 255, 0, 0.6), 0 0 40px rgba(0, 217, 0, 0.3);
}

.load-btn:active {
  transform: translateY(0);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 6rem;
}

.spinner {
  width: 64px;
  height: 64px;
  border: 6px solid var(--color-gray-200);
  border-top-color: var(--color-yellow);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 20px rgba(222, 255, 0, 0.3);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.loading-subtext {
  font-size: 1rem;
  color: var(--text-muted);
}

/* Dashboard Content */
.dashboard-content {
  width: 100%;
  max-width: 1400px;
  margin-top: 2rem;
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
