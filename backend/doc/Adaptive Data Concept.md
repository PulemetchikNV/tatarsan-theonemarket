flowchart TD
    START((START)) --> INPUT[/"role, region, query"/]
    
    INPUT --> DC1["🤖 Data Collector<br/><i>LLM decides what APIs to call</i>"]
    INPUT --> DC2["🤖 Market Researcher<br/><i>LLM decides what to research</i>"]
    INPUT --> DC3["🤖 Event Tracker<br/><i>LLM decides what events matter</i>"]
    
    DC1 --> |"{ vacancies?, salaries?, ... }"|MERGE
    DC2 --> |"{ trends?, competition?, ... }"|MERGE
    DC3 --> |"{ events?, news?, ... }"|MERGE
    
    MERGE["🔀 Merge<br/><i>Combine all collected data</i>"] --> ANALYZE
    
    ANALYZE["🤖 Analyze & Classify<br/><i>LLM works with available data</i>"] --> REPORT
    
    REPORT["🤖 Generate Report<br/><i>LLM knows role → tailored output</i>"] --> END((END))
    
    style DC1 fill:#e1f5fe
    style DC2 fill:#e1f5fe
    style DC3 fill:#e1f5fe
    style ANALYZE fill:#fff3e0
    style REPORT fill:#fff3e0