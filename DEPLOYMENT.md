# Naija Lotto Oracle - AWS SAM Deployment Guide

This guide walks you through deploying the complete Naija Lotto Oracle stack on AWS using SAM.

## Architecture

- **Frontend**: React + TypeScript with Vite (deployed to S3 + CloudFront)
- **Backend**: AWS Lambda functions using Claude Sonnet 4.5 via Bedrock
- **API**: API Gateway with Cognito authentication
- **Database**: DynamoDB for caching predictions
- **Auth**: Amazon Cognito for user management

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **SAM CLI** installed (version 1.108 or higher)
4. **Node.js** (v18 or higher) for frontend
5. **Python** (3.11+) for Lambda functions
6. **Git** for version control

### Installation

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install SAM CLI
brew install aws-sam-cli  # macOS
# or for Linux:
pip install aws-sam-cli

# Configure AWS credentials
aws configure
```

## Step 1: Enable Bedrock Claude Access

Before deploying, you need to enable Claude Sonnet 3.5 in Bedrock:

```bash
# Check available models in Bedrock
aws bedrock list-foundation-models --region us-east-1

# Request access to Claude (if not already enabled)
# Visit: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/models/
# Find "Anthropic Claude 3.5 Sonnet" and click "Edit model access"
# Click "Manage model access"
# Check the Claude 3.5 Sonnet checkbox and save
```

## Step 2: Setup Cognito (Optional but Recommended)

If you want to use Cognito authentication:

```bash
# Create Cognito User Pool
aws cognito-idp create-user-pool \
  --pool-name naija-lotto-users \
  --region us-east-1

# Create Cognito Client
# Update aws-exports.js with the User Pool ID and Client ID
```

Or use AWS Amplify CLI:

```bash
amplify init
amplify add auth
amplify push
```

## Step 3: Build and Deploy with SAM

### Build the SAM template

```bash
cd /workspaces/Naija_Lotto_Oracle
sam build
```

Expected output:
```
Building codebase in the Docker image...
Successfully packaged artifacts and wrote the output SAM template...
```

### Deploy to AWS

For guided deployment (recommended for first time):

```bash
sam deploy --guided
```

You'll be prompted for:
- Stack Name: `naija-lotto-oracle`
- AWS Region: `us-east-1`
- Parameter Environment: `prod`
- Confirmation to deploy

For automated deployment (after first time):

```bash
sam deploy
```

## Step 4: Update Frontend Configuration

After deployment, SAM will output the API endpoint. Update `aws-exports.js`:

```javascript
const awsmobile = {
    // ... existing config
    "aws_cloud_logic_custom": [
        {
            "name": "NaijaLottoOracleAPI",
            "endpoint": "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod",
            "region": "us-east-1"
        }
    ]
};
```

## Step 5: Deploy Frontend

### Option A: Automatic with S3 + CloudFront

```bash
# Build frontend
npm run build

# Create S3 bucket
aws s3 mb s3://naija-lotto-oracle-frontend-$(date +%s) --region us-east-1

# Upload to S3
aws s3 sync dist/ s3://naija-lotto-oracle-frontend-BUCKET_NAME/ --delete

# Create CloudFront distribution (optional but recommended)
# See CloudFront setup in AWS console
```

### Option B: Deploy with Amplify Hosting

```bash
amplify add hosting
amplify publish
```

## Step 6: Monitor and Test

### View Lambda logs

```bash
# Predictions function
sam logs -n PredictionsFunction --stack-name naija-lotto-oracle --tail

# Analysis function
sam logs -n AnalysisFunction --stack-name naija-lotto-oracle --tail
```

### Test API endpoints

```bash
# Get authorization token from Cognito
TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=your_email PASSWORD=your_password \
  --region us-east-1 \
  --query 'AuthenticationResult.AccessToken' \
  --output text)

# Test predictions endpoint
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/predictions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"game": "Premier Star", "mode": "singleYear", "year": 2024}'

# Test analysis endpoint
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"game": "Premier Star", "mode": "singleYear", "year": 2024, "number": 7}'
```

## Cleanup

To delete the entire stack:

```bash
sam delete --stack-name naija-lotto-oracle --region us-east-1
```

## Troubleshooting

### Lambda timeout issues
- Increase timeout in `template.yaml`: `Timeout: 120` → `Timeout: 300`
- Rebuild and redeploy: `sam deploy`

### Bedrock access denied
- Ensure Bedrock model access is enabled in the region
- Check IAM role permissions in CloudFormation events

### API Gateway CORS errors
- CORS is configured in `template.yaml`, but may need adjustment for your domain
- Update `AllowOrigin` in the template and redeploy

### DynamoDB throttling
- The table uses `PAY_PER_REQUEST` billing (on-demand)
- No manual scaling needed for reasonable traffic

## Cost Optimization

- **Lambda**: You get 1M free requests per month
- **Bedrock**: Pay per input/output tokens (~$3/$15 per 1M tokens for Claude)
- **DynamoDB**: Pay per request (on-demand)
- **API Gateway**: $3.50 per million requests
- **CloudFront**: Standard pricing for data transfer

Consider:
- Setting CloudWatch alarms for cost thresholds
- Using Lambda reserved concurrency
- Enabling DynamoDB caching to reduce API calls

## Next Steps

1. Set up monitoring with CloudWatch dashboards
2. Configure auto-scaling policies
3. Set up CI/CD with GitHub Actions
4. Add custom domain with Route 53
5. Enable CloudTrail for audit logging

## Support

For issues:
- Check CloudWatch logs in AWS Console
- Review SAM documentation: https://docs.aws.amazon.com/serverless-application-model/
- Check Bedrock documentation: https://docs.aws.amazon.com/bedrock/
