import type { DashboardResponse } from '../composables/useApi'

/**
 * Mock данные для Dashboard
 * Использует единую систему CSS из style.css
 */
export const mockDashboardResponse: DashboardResponse = {
  htmlComponents: `
    <div class="content-wrap">
      <!-- Ключевые метрики -->
      <div class="grid grid-4">
        <div class="card card-metric success">
          <div class="card-title">Компаний в базе</div>
          <div class="card-value">127</div>
          <div class="card-subtitle">+12 за месяц</div>
        </div>
        
        <div class="card card-metric primary">
          <div class="card-title">Открытых вакансий</div>
          <div class="card-value">485</div>
          <div class="card-subtitle">Татарстан</div>
        </div>
        
        <div class="card card-metric warning">
          <div class="card-title">Средняя зарплата</div>
          <div class="card-value">165,000 ₽</div>
          <div class="card-subtitle">для Middle</div>
        </div>
        
        <div class="card card-metric purple">
          <div class="card-title">Health Score</div>
          <div class="card-value">78/100</div>
          <div class="card-subtitle">по региону</div>
        </div>
      </div>

      <!-- Топ компании -->
      <div class="section">
        <h2 class="section-title">🏆 Топ компании по Health Score</h2>
        <div class="company-list">
          <div class="company-item">
            <div class="company-info">
              <div class="company-name">Иннополис</div>
              <div class="company-meta">EdTech • Growth стадия</div>
            </div>
            <div class="health-score high">92/100</div>
          </div>
          
          <div class="company-item">
            <div class="company-info">
              <div class="company-name">Таттелеком</div>
              <div class="company-meta">Telecom • Mature</div>
            </div>
            <div class="health-score high">85/100</div>
          </div>
          
          <div class="company-item">
            <div class="company-info">
              <div class="company-name">Bars Group</div>
              <div class="company-meta">FinTech • Growth стадия</div>
            </div>
            <div class="health-score high">82/100</div>
          </div>
        </div>
      </div>

      <!-- Топ технологии -->
      <div class="chart-container">
        <h3 class="chart-title">🔥 Топ-5 технологий по спросу</h3>
        <div class="bar-chart">
          <div class="bar-item">
            <span class="bar-label">TypeScript</span>
            <div class="bar-track">
              <div class="bar-fill primary" style="width: 95%;">95/100</div>
            </div>
          </div>
          
          <div class="bar-item">
            <span class="bar-label">Python</span>
            <div class="bar-track">
              <div class="bar-fill success" style="width: 92%;">92/100</div>
            </div>
          </div>
          
          <div class="bar-item">
            <span class="bar-label">React</span>
            <div class="bar-track">
              <div class="bar-fill info" style="width: 90%;">90/100</div>
            </div>
          </div>
          
          <div class="bar-item">
            <span class="bar-label">Node.js</span>
            <div class="bar-track">
              <div class="bar-fill purple" style="width: 88%;">88/100</div>
            </div>
          </div>
          
          <div class="bar-item">
            <span class="bar-label">PostgreSQL</span>
            <div class="bar-track">
              <div class="bar-fill warning" style="width: 85%;">85/100</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Тренды -->
      <div class="section">
        <h3 class="section-subtitle">📈 Рыночные тренды</h3>
        <ul class="list">
          <li class="list-item">
            <span class="list-icon">🤖</span>
            <span class="list-content">AI и Machine Learning доминируют в спросе (+25% за год)</span>
          </li>
          <li class="list-item">
            <span class="list-icon">☁️</span>
            <span class="list-content">Рост интереса к Cloud Native технологиям</span>
          </li>
          <li class="list-item">
            <span class="list-icon">⚡</span>
            <span class="list-content">TypeScript вытесняет JavaScript в корпоративной разработке</span>
          </li>
          <li class="list-item">
            <span class="list-icon">🔧</span>
            <span class="list-content">Дефицит DevOps и SRE специалистов</span>
          </li>
          <li class="list-item">
            <span class="list-icon">💰</span>
            <span class="list-content">Увеличение зарплат для Senior разработчиков на 15-20%</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  totalHealthScore: 78,
}

/**
 * Имитация задержки API
 */
export const mockDashboardDelay = () => 
  new Promise<DashboardResponse>(resolve => 
    setTimeout(() => resolve(mockDashboardResponse), 800)
  )
