import type { CompanyResponse } from '../composables/useApi'

/**
 * Mock данные для анализа компании "Иннополис"
 * Использует единую систему CSS из style.css
 */
const innopolisMock: CompanyResponse = {
  name: 'Иннополис',
  industry: 'EdTech',
  htmlComponents: `
    <div class="content-wrap">
      <!-- Хедер -->
      <div class="report-header">
        <h1 class="report-title">Иннополис</h1>
        <div class="report-badges">
          <span class="badge badge-primary">EdTech</span>
          <span class="badge badge-success">Growth стадия</span>
        </div>
      </div>

      <!-- Ключевые метрики -->
      <div class="grid grid-4">
        <div class="card card-metric success">
          <div class="card-title">Health Score</div>
          <div class="card-value">92/100</div>
          <div class="card-subtitle">✅ Отличное здоровье</div>
        </div>
        
        <div class="card card-metric primary">
          <div class="card-title">Открытых вакансий</div>
          <div class="card-value">23</div>
          <div class="card-subtitle">на HH.ru</div>
        </div>
        
        <div class="card card-metric warning">
          <div class="card-title">Средняя зарплата</div>
          <div class="card-value">185,000 ₽</div>
          <div class="card-subtitle">для Middle</div>
        </div>
        
        <div class="card card-metric purple">
          <div class="card-title">GitHub активность</div>
          <div class="card-value">247</div>
          <div class="card-subtitle">коммитов/месяц</div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div class="section">
        <h2 class="section-title">📊 Executive Summary</h2>
        <div class="section-content">
          <p>Иннополис демонстрирует высокую активность разработки и стабильный рост. Компания фокусируется на образовательных технологиях с применением AI/ML. Сильная команда и современный tech stack (Python, React, TypeScript) обеспечивают конкурентное преимущество.</p>
        </div>
      </div>

      <!-- Сильные стороны -->
      <div class="section">
        <h3 class="section-subtitle">💪 Сильные стороны</h3>
        <ul class="list">
          <li class="list-item">
            <span class="list-icon">✅</span>
            <span class="list-content">Современный tech stack (Python, React, TypeScript)</span>
          </li>
          <li class="list-item">
            <span class="list-icon">✅</span>
            <span class="list-content">Высокая активность в open source (GitHub)</span>
          </li>
          <li class="list-item">
            <span class="list-icon">✅</span>
            <span class="list-content">Стабильный рост команды (+15% за год)</span>
          </li>
          <li class="list-item">
            <span class="list-icon">✅</span>
            <span class="list-content">Экспертиза в AI/ML и образовательных технологиях</span>
          </li>
          <li class="list-item">
            <span class="list-icon">✅</span>
            <span class="list-content">Сильное техническое комьюнити</span>
          </li>
        </ul>
      </div>

      <!-- Риски -->
      <div class="section">
        <h3 class="section-subtitle">⚠️ Потенциальные риски</h3>
        <ul class="list">
          <li class="list-item">
            <span class="list-icon">⚠️</span>
            <span class="list-content">Зависимость от государственного финансирования</span>
          </li>
          <li class="list-item">
            <span class="list-icon">⚠️</span>
            <span class="list-content">Конкуренция с международными EdTech платформами</span>
          </li>
          <li class="list-item">
            <span class="list-icon">⚠️</span>
            <span class="list-content">Необходимость масштабирования инфраструктуры</span>
          </li>
        </ul>
      </div>

      <!-- Спрос на технологии -->
      <div class="chart-container">
        <h3 class="chart-title">🔥 Спрос на технологии компании</h3>
        <div class="bar-chart">
          <div class="bar-item">
            <span class="bar-label">Python</span>
            <div class="bar-track">
              <div class="bar-fill success" style="width: 92%;">92/100</div>
            </div>
          </div>
          <div class="bar-item">
            <span class="bar-label">React</span>
            <div class="bar-track">
              <div class="bar-fill primary" style="width: 90%;">90/100</div>
            </div>
          </div>
          <div class="bar-item">
            <span class="bar-label">TypeScript</span>
            <div class="bar-track">
              <div class="bar-fill info" style="width: 95%;">95/100</div>
            </div>
          </div>
          <div class="bar-item">
            <span class="bar-label">PostgreSQL</span>
            <div class="bar-track">
              <div class="bar-fill purple" style="width: 85%;">85/100</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Рекомендация -->
      <div class="recommendation invest">
        <h2 class="recommendation-title">🎯 Финальная рекомендация</h2>
        <div class="recommendation-badge invest">
          ✅ ИНВЕСТИРОВАТЬ
        </div>
        <div class="recommendation-content">
          <strong>Обоснование:</strong> Компания показывает высокую активность разработки, имеет современный tech stack и сильную команду. EdTech сектор растет на 15-20% в год. Риски управляемы. Рекомендуем к инвестициям с горизонтом 2-3 года.
        </div>
      </div>
    </div>
  `,
}

/**
 * Mock данные для "Таттелеком"
 */
const tattelecomMock: CompanyResponse = {
  name: 'Таттелеком',
  industry: 'Telecom',
  htmlComponents: `
    <div class="content-wrap">
      <div class="report-header">
        <h1 class="report-title">Таттелеком</h1>
        <div class="report-badges">
          <span class="badge badge-info">Telecom</span>
          <span class="badge badge-warning">Mature</span>
        </div>
      </div>

      <div class="grid grid-4">
        <div class="card card-metric success">
          <div class="card-title">Health Score</div>
          <div class="card-value">85/100</div>
          <div class="card-subtitle">✅ Хорошее здоровье</div>
        </div>
        
        <div class="card card-metric primary">
          <div class="card-title">Открытых вакансий</div>
          <div class="card-value">15</div>
          <div class="card-subtitle">на HH.ru</div>
        </div>
        
        <div class="card card-metric warning">
          <div class="card-title">Средняя зарплата</div>
          <div class="card-value">210,000 ₽</div>
          <div class="card-subtitle">для Middle</div>
        </div>
        
        <div class="card card-metric purple">
          <div class="card-title">GitHub активность</div>
          <div class="card-value">156</div>
          <div class="card-subtitle">коммитов/месяц</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📊 Executive Summary</h2>
        <div class="section-content">
          <p>Таттелеком - зрелая телеком компания с большим опытом и стабильной позицией на рынке. Активно внедряет современные технологии и развивает digital-направления. Сильная инженерная культура и использование передовых решений (Kubernetes, микросервисы).</p>
        </div>
      </div>

      <div class="recommendation watch">
        <h2 class="recommendation-title">🎯 Финальная рекомендация</h2>
        <div class="recommendation-badge watch">
          👀 НАБЛЮДАТЬ
        </div>
        <div class="recommendation-content">
          <strong>Обоснование:</strong> Стабильная компания с хорошими показателями, но рост ограничен зрелостью рынка. Рекомендуем мониторинг новых digital-направлений компании.
        </div>
      </div>
    </div>
  `,
}

/**
 * Маппинг компаний к их mock данным
 */
const companyMocks: Record<string, CompanyResponse> = {
  'иннополис': innopolisMock,
  'innopolis': innopolisMock,
  'таттелеком': tattelecomMock,
  'tattelecom': tattelecomMock,
}

/**
 * Получить mock данные для компании
 */
export const getCompanyMock = (companyName: string): CompanyResponse => {
  const normalized = companyName.toLowerCase().trim()
  return companyMocks[normalized] || innopolisMock // fallback на Иннополис
}

/**
 * Имитация задержки API
 */
export const mockCompanyDelay = (companyName: string) =>
  new Promise<CompanyResponse>(resolve =>
    setTimeout(() => resolve(getCompanyMock(companyName)), 1200)
  )
