# Vertex AI Query Instructions for BigQuery

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Basic Query Structure](#basic-query-structure)
3. [Common Use Cases](#common-use-cases)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

## Prerequisites
- Enabled APIs (BigQuery, Vertex AI)
- Configured connection (`llm_connection`)
- Created remote model (`llm_model`)
- Appropriate IAM permissions

## Basic Query Structure

### Template Query
```sql
WITH InputData AS (
  -- Your data preparation here
  SELECT your_fields FROM your_table WHERE your_conditions
),
FormattedPrompt AS (
  -- Format the prompt for the LLM
  SELECT CONCAT(
    "Your instruction here: ",
    STRING_AGG(your_formatted_content, "\n" ORDER BY your_order_field)
  ) as prompt
  FROM InputData
)
SELECT (
  SELECT ml_generate_text_result 
  FROM ML.GENERATE_TEXT(
    MODEL `your-project.your-dataset.llm_model`,
    (SELECT prompt),
    STRUCT(
      0.3 as temperature,
      2048 as max_output_tokens
    )
  )
) as generated_result
FROM FormattedPrompt;
```

### Key Components
1. **Data Preparation (InputData CTE)**
   - Filter relevant data
   - Join necessary tables
   - Clean and format input data

2. **Prompt Formatting (FormattedPrompt CTE)**
   - Structure your prompt clearly
   - Include necessary context
   - Use STRING_AGG for multiple rows

3. **Model Parameters**
   - temperature: 0.0-1.0 (lower = more focused)
   - max_output_tokens: limit response length

## Common Use Cases

### 1. Translation Query
```sql
WITH ThreadMessages AS (
  SELECT timestamp, author_name, content 
  FROM `your-project.your-dataset.messages` 
  WHERE thread_id = "your-thread-id" 
  ORDER BY timestamp
),
FormattedPrompt AS (
  SELECT CONCAT(
    "Translate this conversation to English and provide a summary:\n\n",
    STRING_AGG(CONCAT(author_name, ": ", IFNULL(content, "")), "\n" ORDER BY timestamp)
  ) as prompt 
  FROM ThreadMessages
)
SELECT (
  SELECT ml_generate_text_result 
  FROM ML.GENERATE_TEXT(
    MODEL `your-project.your-dataset.llm_model`,
    (SELECT prompt),
    STRUCT(0.3 as temperature, 2048 as max_output_tokens)
  )
) as translation_and_summary
FROM FormattedPrompt;
```

### 2. Summarization Query
```sql
WITH ChannelMessages AS (
  SELECT content, timestamp
  FROM `your-project.your-dataset.messages`
  WHERE channel_id = "your-channel-id"
  AND timestamp BETWEEN TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND CURRENT_TIMESTAMP()
),
FormattedPrompt AS (
  SELECT CONCAT(
    "Provide a concise summary of the following Discord messages from the last 24 hours:\n\n",
    STRING_AGG(content, "\n" ORDER BY timestamp)
  ) as prompt
  FROM ChannelMessages
)
SELECT (
  SELECT ml_generate_text_result 
  FROM ML.GENERATE_TEXT(
    MODEL `your-project.your-dataset.llm_model`,
    (SELECT prompt),
    STRUCT(0.2 as temperature, 1024 as max_output_tokens)
  )
) as daily_summary
FROM FormattedPrompt;
```

## Best Practices

### 1. Prompt Engineering
- Be specific in instructions
- Include format requirements
- Provide context when needed
- Use consistent formatting

### 2. Performance Optimization
- Filter data before aggregation
- Limit input size when possible
- Use appropriate temperature settings
- Consider token limits

### 3. Error Handling
- Use IFNULL for nullable fields
- Validate input data
- Check output format requirements
- Monitor token usage

### 4. Cost Management
- Batch similar requests
- Cache common results
- Use lower temperature for deterministic tasks
- Monitor usage patterns

## Troubleshooting

### Common Issues and Solutions

1. **Token Limit Exceeded**
   - Reduce input size
   - Split into multiple queries
   - Use more focused prompts

2. **Unclear Results**
   - Adjust temperature
   - Improve prompt specificity
   - Add format requirements

3. **Performance Issues**
   - Optimize data filtering
   - Reduce input size
   - Use appropriate indexes

4. **Permission Errors**
   - Verify IAM roles
   - Check connection settings
   - Validate project access

### Query Validation
Before running expensive operations:
```sql
-- Check input data size
SELECT COUNT(*), 
       AVG(LENGTH(content)) as avg_length,
       MAX(LENGTH(content)) as max_length
FROM your_input_table
WHERE your_conditions;

-- Validate prompt formatting
SELECT prompt, LENGTH(prompt) as prompt_length
FROM your_formatted_prompt_cte
LIMIT 1;
```
