# OpenAI API Key Setup

## Railway Environment Variable

To fix the "invalid token" error, you need to set the OpenAI API key in Railway:

1. Go to your Railway project dashboard
2. Select your backend service
3. Go to the "Variables" tab
4. Add a new variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: [Your OpenAI API key - starts with `sk-proj-` or `sk-`]
5. Save and redeploy

The backend will automatically pick up this environment variable and use it for OpenAI API calls.

**Note**: Keep your API key secure and never commit it to version control.

