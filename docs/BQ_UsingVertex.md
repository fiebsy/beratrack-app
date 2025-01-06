# Using Vertex AI with BigQuery

This guide provides step-by-step instructions for setting up and using Vertex AI models within BigQuery for text analysis and generation.

## Prerequisites

- Google Cloud Project with billing enabled
- BigQuery dataset created
- Appropriate IAM permissions (BigQuery Admin, Vertex AI User)

## Step 1: Enable Required APIs

```bash
# Enable BigQuery API
gcloud services enable bigquery.googleapis.com

# Enable BigQuery Connection API
gcloud services enable bigqueryconnection.googleapis.com

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Enable PaLM API (for Gemini models)
gcloud services enable generativelanguage.googleapis.com
```

## Step 2: Create BigQuery Connection

1. Create a Cloud Resource connection:
```bash
bq mk --connection \
  --location=us \
  --project_id=YOUR_PROJECT_ID \
  --connection_type=CLOUD_RESOURCE \
  llm_connection
```

2. Verify the connection:
```bash
bq show --connection YOUR_PROJECT_ID.us.llm_connection
```

3. Note the service account from the output (you'll need it for the next step)

## Step 3: Set Up Model

Create a remote model in your dataset:

```sql
CREATE OR REPLACE MODEL `your-project.your_dataset.llm_model`
REMOTE WITH CONNECTION `us.llm_connection`
OPTIONS(endpoint = "gemini-1.0-pro-001");
```

## Step 4: Query Examples

### Basic Text Generation
```sql
WITH input_data AS (
  SELECT "Your prompt here" as prompt
)
SELECT ml_generate_text_result
FROM ML.GENERATE_TEXT(
  MODEL `your-project.your_dataset.llm_model`,
  (SELECT prompt FROM input_data),
  STRUCT(
    0.2 as temperature,
    1024 as max_output_tokens
  )
);
```

### Analyze Discord Messages
```sql
WITH discord_messages AS (
  SELECT 
    content,
    author_name,
    timestamp
  FROM `your-project.your_dataset.messages`
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
),
grouped_messages AS (
  SELECT STRING_AGG(
    CONCAT(author_name, ": ", content),
    "\n" ORDER BY timestamp
  ) as conversation
),
analysis_prompt AS (
  SELECT CONCAT(
    "Analyze these Discord messages and provide a JSON response with: ",
    "overall_sentiment (-1 to 1), main_topics (array), and summary. Messages:\n",
    conversation
  ) as prompt
  FROM grouped_messages
)
SELECT ml_generate_text_result
FROM ML.GENERATE_TEXT(
  MODEL `your-project.your_dataset.llm_model`,
  (SELECT prompt FROM analysis_prompt),
  STRUCT(0.2 as temperature, 1024 as max_output_tokens)
);
```

## Common Parameters

- `temperature`: Controls randomness (0.0 to 1.0)
  - Lower values (0.1-0.3): More focused, consistent outputs
  - Higher values (0.7-1.0): More creative, varied outputs
- `max_output_tokens`: Maximum length of generated text (1-1024)

## Best Practices

1. **Prompt Engineering**
   - Be specific and clear in your prompts
   - Include examples if needed
   - Structure output format in the prompt

2. **Performance**
   - Use appropriate temperature settings
   - Batch similar requests together
   - Consider creating views for common analyses

3. **Cost Management**
   - Monitor usage with BigQuery audit logs
   - Set up budget alerts
   - Use appropriate token limits

## Useful Links

- [BigQuery ML Generate Text Tutorial](https://cloud.google.com/bigquery/docs/generate-text-tutorial)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [BigQuery ML Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql/bigqueryml-syntax-create)
- [Gemini Model Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Verify service account permissions
   - Check API enablement
   - Ensure proper IAM roles

2. **Query Errors**
   - Verify model name and path
   - Check connection status
   - Validate prompt format

3. **Performance Issues**
   - Monitor query performance
   - Check token limits
   - Verify resource quotas

## Maintenance

To update or recreate the model:

```sql
-- Drop existing model
DROP MODEL IF EXISTS `your-project.your_dataset.llm_model`;

-- Create new model
CREATE OR REPLACE MODEL `your-project.your_dataset.llm_model`
REMOTE WITH CONNECTION `us.llm_connection`
OPTIONS(endpoint = "gemini-1.0-pro-001");
```

Remember to test the model with a simple query after recreation:

```sql
WITH test_data AS (
  SELECT "Hello, how are you?" as prompt
)
SELECT ml_generate_text_result
FROM ML.GENERATE_TEXT(
  MODEL `your-project.your_dataset.llm_model`,
  (SELECT prompt FROM test_data),
  STRUCT(0.2 as temperature, 100 as max_output_tokens)
);
```
