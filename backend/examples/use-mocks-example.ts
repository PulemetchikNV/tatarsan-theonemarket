/**
 * Пример использования Mock APIs и агентов
 * 
 * Запуск: tsx examples/use-mocks-example.ts
 */

import { dataCollectorAgent } from '../src/core/langchain/agents/dataCollectorAgent.js';
import { industryClassifierAgent } from '../src/core/langchain/agents/industryClassifierAgent.js';
import { marketResearcherAgent } from '../src/core/langchain/agents/marketResearcherAgent.js';
import type { Company } from '../src/core/types/index.js';

async function main() {
  console.log('🚀 Пример работы с Mock APIs и агентами\n');

  // 1. Data Collection
  console.log('📊 Шаг 1: Сбор данных о компании "Таттелеком"...\n');
  const collectedData = await dataCollectorAgent.collect('Таттелеком');

  console.log('✅ Данные собраны:');
  console.log(`  - Вакансий на HH: ${collectedData.hhData?.totalVacancies || 0}`);
  console.log(`  - Репозиториев на GitHub: ${collectedData.githubData?.totalRepos || 0}`);
  console.log(`  - Статей на Habr: ${collectedData.habrData?.totalArticles || 0}\n`);

  // 2. Industry Classification
  console.log('🏢 Шаг 2: Классификация индустрии...\n');
  
  const company: Company = {
    name: 'Таттелеком',
    techStack: collectedData.hhData?.requiredSkills || [],
    location: 'Татарстан',
  };

  const classificationResult = await industryClassifierAgent.classify(company, collectedData);

  console.log('✅ Классификация завершена:');
  console.log(`  - Основная индустрия: ${classificationResult.primaryIndustry}`);
  console.log(`  - Дополнительно: ${classificationResult.secondaryIndustries.join(', ') || 'нет'}`);
  console.log(`  - Стадия: ${classificationResult.stage}`);
  console.log(`  - Уверенность: ${classificationResult.confidence}%\n`);

  // 3. Market Research
  console.log('📈 Шаг 3: Рыночное исследование...\n');
  
  const marketResult = await marketResearcherAgent.research('Таттелеком', collectedData);

  console.log('✅ Исследование завершено:');
  console.log(`  - Трендов: ${marketResult.marketTrends.length}`);
  console.log(`  - Технологий оценено: ${Object.keys(marketResult.demandForTech).length}`);
  console.log(`  - Потенциал роста: ${marketResult.growthPotential}/100\n`);

  console.log('📊 Топ-5 технологий по спросу:');
  const topTechs = Object.entries(marketResult.demandForTech)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  topTechs.forEach(([tech, demand], i) => {
    console.log(`  ${i + 1}. ${tech}: ${demand}/100`);
  });

  console.log('\n🎉 Пример завершен!\n');
}

main().catch(console.error);

