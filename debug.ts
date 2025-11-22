import { NLPAgent } from "./src/agent/analyzer";
import { logger } from "./src/utils/logger";

async function main() {
    const agent = new NLPAgent();

    const testCases = [
        {
            name: "Fintech Case",
            text: `
        Stripe is a financial infrastructure platform for the internet. 
        They use Ruby and Go for their backend services and React for the dashboard.
        They compete with PayPal and Adyen.
      `,
        },
        {
            name: "AI Case",
            text: `
        Anthropic is an AI safety and research company that builds reliable, interpretable, and steerable AI systems.
        They train large language models using Python, PyTorch, and massive GPU clusters on AWS.
        Their main product is Claude.
      `,
        },
        {
            name: "Gaming Case",
            text: `
        Unity Technologies offers a platform for creating 3D content.
        Game developers use C# scripting within the Unity engine.
        It competes with Unreal Engine by Epic Games.
      `,
        },
        {
            name: "Cloud Infrastructure Case (Timeweb)",
            text: `
        Отрасли: Связь и телекоммуникации
        О компании:
        Timeweb Cloud — облачная инфраструктура для бизнеса.
        
        Разворачивайте и масштабируйте инфраструктуру на виртуальных серверах в России, Казахстане и Европе. Перенос проектов любого уровня — бесплатно.
        
        Арендуйте выделенные серверы в Москве, Санкт-Петербурге, Польше и Нидерландах: готовые сборки или сервер под заказ. Стандартную сборку установим в течение часа, а сервер под заказ — за неделю.
        
        Создавайте управляемые базы данных в несколько кликов. Решение полностью настроено и готово к использованию.
        
        Автоматизируйте управление кластерами Kubernetes: развертывайте, масштабируйте и настраивайте мониторинг.
        
        Повышайте доступность своих проектов с помощью балансировщика. У пользователей всегда будет доступ к вашему проекту, даже если трафик на него резко увеличится.
        
        Размещайте любые типы статических данных в объектном S3-хранилище: архивы, бэкапы, фото и видео, логи и журналы, а также статические сайты.
        
        Автоматизируйте CI/CD, с помощью сервиса Apps, выбрав свой фреймворк и подключив гит-репозиторий к панели.
      `,
        },
    ];

    logger.info("Running debug analysis...");

    for (const test of testCases) {
        logger.info(`--- Analyzing: ${test.name} ---`);
        try {
            const result = await agent.analyze(test.text);
            logger.info("Result:", JSON.stringify(result, null, 2));
        } catch (error) {
            logger.error(`Analysis failed for ${test.name}:`, error);
        }
    }
}

main();
