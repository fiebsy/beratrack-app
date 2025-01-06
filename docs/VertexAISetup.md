# Vertex AI Setup Guide for BigQuery

## Prerequisites
- Google Cloud Project with billing enabled
- BigQuery dataset where you want to integrate AI features
- Appropriate permissions (Project Owner or Editor)

## Step 1: Enable Required APIs

Run these commands in your terminal:
```bash
# Enable the BigQuery API
gcloud services enable bigquery.googleapis.com

# Enable the BigQuery Connection API
gcloud services enable bigqueryconnection.googleapis.com

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

## Step 2: Create BigQuery Connection

1. Create the Cloud Resource connection:
```bash
bq mk --connection \
  --location=us \
  --project_id=pickaxe-dashboard \
  --connection_type=CLOUD_RESOURCE \
  llm_connection
```

2. Verify the connection was created:
```bash
bq show --connection pickaxe-dashboard.us.llm_connection
```

3. Copy the service account email from the output. It will look like:
`bqcx-1087531086555-qyne@gcp-sa-bigquery-condel.iam.gserviceaccount.com`

## Step 3: Grant Required Permissions

Grant Vertex AI user role to the service account:
```bash
gcloud projects add-iam-policy-binding pickaxe-dashboard \
  --member="serviceAccount:bqcx-1087531086555-qyne@gcp-sa-bigquery-condel.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## Step 4: Create Remote Model

Run this SQL query in BigQuery:
```sql
CREATE OR REPLACE MODEL `pickaxe-dashboard.discord_berachain.llm_model`
REMOTE WITH CONNECTION `pickaxe-dashboard.us.llm_connection`
OPTIONS(endpoint = "gemini-1.0-pro-001");
```

## Step 5: Test the Setup

Run this test query to verify everything is working:
```sql
SELECT ml_generate_text_result
FROM ML.GENERATE_TEXT(
  MODEL `pickaxe-dashboard.discord_berachain.llm_model`,
  (
    SELECT "What is the capital of France?" as prompt
  ),
  STRUCT(
    0.2 as temperature,
    1024 as max_output_tokens
  )
);
```

## Troubleshooting

### Common Issues and Solutions

1. **Connection Creation Fails**
   - Verify you have the necessary permissions
   - Check if the location is supported
   - Ensure the project ID is correct

2. **Permission Error**
   ```
   Error: Permission denied while using the Vertex AI model
   ```
   Solution:
   - Double-check the service account email
   - Verify the IAM role was properly assigned
   - Wait a few minutes for permissions to propagate

3. **Model Creation Fails**
   ```
   Error: Invalid endpoint specified
   ```
   Solution:
   - Verify the endpoint name is correct
   - Check if the model is available in your region
   - Ensure the APIs are properly enabled

4. **Query Execution Fails**
   ```
   Error: Resource exhausted or quota exceeded
   ```
   Solution:
   - Check your project's quota limits
   - Verify billing is enabled
   - Reduce batch size or request frequency

## Best Practices

1. **Resource Management**
   - Use appropriate temperature settings (0.2-0.8)
   - Set reasonable max_output_tokens
   - Implement retry logic for failures

2. **Cost Control**
   - Monitor usage with BigQuery audit logs
   - Set up budget alerts
   - Use batch processing when possible

3. **Security**
   - Regularly audit service account permissions
   - Use principle of least privilege
   - Monitor access patterns

## Next Steps

After successful setup:
1. Create specialized tables for AI outputs
2. Set up scheduled jobs for processing
3. Implement monitoring and alerting
4. Document usage patterns and costs

## Validation Queries

### 1. Check Connection Status
```sql
SELECT * FROM `region-us.INFORMATION_SCHEMA.CONNECTIONS`
WHERE connection_id LIKE '%llm_connection%';
```

### 2. Verify Model Creation
```sql
SELECT * FROM `pickaxe-dashboard.discord_berachain.INFORMATION_SCHEMA.MODELS`
WHERE model_id = 'llm_model';
```

### 3. Test Model Performance
```sql
WITH TestCases AS (
  SELECT 'Test 1' as test_id, 'Translate: Bonjour le monde' as prompt UNION ALL
  SELECT 'Test 2', 'Summarize: This is a test message'
)
SELECT 
  test_id,
  prompt,
  ML.GENERATE_TEXT(
    MODEL `pickaxe-dashboard.discord_berachain.llm_model`,
    (SELECT prompt),
    STRUCT(
      0.2 as temperature,
      1024 as max_output_tokens
    )
  ) as response
FROM TestCases;
```



Let me break this down simply:

**What We Have Now:**
- We're using a basic Gemini model (`gemini-1.0-pro-001`)
- It's like a Swiss Army knife - good at many things but not specialized
- We've used it for basic translation and summarization

**Why Different Models Matter:**
1. **Text Summarization** (text-bison)
   - Better at creating structured summaries
   - More efficient with token usage
   - Example: "Give me the key points from today's Discord discussions"

2. **Chat Analysis** (chat-bison)
   - Specialized for conversation flows
   - Better understands context between messages
   - Example: "How did this discussion evolve over time?"

3. **General Translation** (Gemini)
   - Good at handling multiple languages
   - Understands cultural context
   - Example: "Translate this Russian conversation to English"

**Real-World Example:**
Think of it like this:
- Gemini = General contractor (can do everything decently)
- text-bison = Professional writer (better at summaries)
- chat-bison = Conversation analyst (better at chat flows)

**Why This Matters for Your Bot:**
If you want to build a Twitter bot that summarizes Discord activity, you might want:
1. text-bison for creating concise, Twitter-friendly summaries
2. chat-bison for understanding conversation context
3. Gemini for handling any non-English conversations

Would you like me to show you example queries that demonstrate these differences in action?

===========================================


I'll show you how to structure queries differently for each model type, with real examples:

1. **Translation Query (using Gemini)**
```sql
-- Good for: Multilingual content, nuanced translations
CREATE OR REPLACE MODEL `pickaxe-dashboard.discord_berachain.translation_model`
REMOTE WITH CONNECTION `pickaxe-dashboard.us.llm_connection`
OPTIONS(endpoint = "gemini-1.0-pro-001");

WITH ThreadMessages AS (
  SELECT timestamp, author_name, content 
  FROM `pickaxe-dashboard.discord_berachain.messages` 
  WHERE thread_id = "1320835039306711060" 
  ORDER BY timestamp
),
FormattedPrompt AS (
  SELECT CONCAT(
    "Translate this conversation to English, preserving tone and context:\n\n",
    STRING_AGG(CONCAT(author_name, ": ", IFNULL(content, "")), "\n" ORDER BY timestamp)
  ) as prompt 
)
SELECT ML.GENERATE_TEXT(
  MODEL `pickaxe-dashboard.discord_berachain.translation_model`,
  (SELECT prompt),
  STRUCT(0.3 as temperature, 2048 as max_output_tokens)
) as translation;
```

2. **Summarization Query (using text-bison)**
```sql
-- Good for: Structured summaries, bullet points, key takeaways
CREATE OR REPLACE MODEL `pickaxe-dashboard.discord_berachain.summary_model`
REMOTE WITH CONNECTION `pickaxe-dashboard.us.llm_connection`
OPTIONS(endpoint = "text-bison@002");

WITH DailyDiscussions AS (
  SELECT 
    channel_name,
    STRING_AGG(content, '\n' ORDER BY timestamp) as discussions
  FROM `pickaxe-dashboard.discord_berachain.messages_with_channels`
  WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  GROUP BY channel_name
),
FormattedPrompt AS (
  SELECT CONCAT(
    "Create a structured summary with these sections:\n",
    "- Main Topics\n",
    "- Key Points\n",
    "- Community Sentiment\n\n",
    "Content:\n", discussions
  ) as prompt
  FROM DailyDiscussions
  WHERE channel_name = 'general'
)
SELECT ML.GENERATE_TEXT(
  MODEL `pickaxe-dashboard.discord_berachain.summary_model`,
  (SELECT prompt),
  STRUCT(
    0.2 as temperature,  -- Lower for more focused, structured output
    1024 as max_output_tokens
  )
) as structured_summary;
```

3. **Conversation Analysis (using chat-bison)**
```sql
-- Good for: Understanding discussion flow, sentiment analysis
CREATE OR REPLACE MODEL `pickaxe-dashboard.discord_berachain.chat_model`
REMOTE WITH CONNECTION `pickaxe-dashboard.us.llm_connection`
OPTIONS(endpoint = "chat-bison@002");

WITH ThreadAnalysis AS (
  SELECT 
    thread_id,
    STRING_AGG(
      CONCAT(author_name, ": ", content),
      '\n' ORDER BY timestamp
    ) as conversation
  FROM `pickaxe-dashboard.discord_berachain.messages`
  WHERE thread_id IS NOT NULL
  GROUP BY thread_id
),
FormattedPrompt AS (
  SELECT CONCAT(
    "Analyze this Discord conversation and provide:\n",
    "1. Main discussion points\n",
    "2. Participant dynamics\n",
    "3. Resolution or outcome\n\n",
    conversation
  ) as prompt
  FROM ThreadAnalysis
  WHERE thread_id = '1320835039306711060'
)
SELECT ML.GENERATE_TEXT(
  MODEL `pickaxe-dashboard.discord_berachain.chat_model`,
  (SELECT prompt),
  STRUCT(
    0.4 as temperature,  -- Balanced for insight and creativity
    2048 as max_output_tokens
  )
) as conversation_analysis;
```

4. **Combined Analysis (using multiple models)**
```sql
WITH ThreadContent AS (
  SELECT thread_id, content, timestamp, author_name
  FROM `pickaxe-dashboard.discord_berachain.messages`
  WHERE thread_id = '1320835039306711060'
),
-- Get translation if needed
Translation AS (
  SELECT ML.GENERATE_TEXT(
    MODEL `pickaxe-dashboard.discord_berachain.translation_model`,
    (SELECT CONCAT("Translate if not English:\n", content)),
    STRUCT(0.1 as temperature, 1024 as max_output_tokens)
  ) as translated_content
  FROM ThreadContent
),
-- Get summary
Summary AS (
  SELECT ML.GENERATE_TEXT(
    MODEL `pickaxe-dashboard.discord_berachain.summary_model`,
    (SELECT CONCAT("Summarize key points:\n", translated_content)),
    STRUCT(0.2 as temperature, 512 as max_output_tokens)
  ) as summary
  FROM Translation
),
-- Get conversation analysis
Analysis AS (
  SELECT ML.GENERATE_TEXT(
    MODEL `pickaxe-dashboard.discord_berachain.chat_model`,
    (SELECT CONCAT("Analyze conversation dynamics:\n", translated_content)),
    STRUCT(0.3 as temperature, 1024 as max_output_tokens)
  ) as analysis
  FROM Translation
)
SELECT 
  summary,
  analysis
FROM Summary, Analysis;
```

**Key Differences in Query Structure:**

1. **Prompt Engineering**:
   - Translation: Focus on preserving meaning and context
   - Summarization: Structured output with specific sections
   - Chat Analysis: Emphasis on conversation flow and dynamics

2. **Temperature Settings**:
   - Translation: Lower (0.1-0.3) for accuracy
   - Summarization: Medium-low (0.2-0.4) for structured but natural output
   - Chat Analysis: Medium (0.3-0.5) for balanced insight

3. **Token Limits**:
   - Translation: Higher limits for full context
   - Summarization: Lower limits for concise output
   - Chat Analysis: Medium limits for detailed analysis

Would you like me to demonstrate any of these queries with actual data from your Discord channels?


