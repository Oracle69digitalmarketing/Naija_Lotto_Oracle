# Quick Start - Deployment Guide for eu-central-1

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed: `aws --version`
- [ ] SAM CLI installed: `sam --version`
- [ ] Bedrock access enabled for Claude 3.5 Sonnet in eu-central-1
- [ ] Python 3.12+ installed: `python3 --version`
- [ ] Node.js 18+ installed: `node --version`

## Step 1: Verify Prerequisites

```bash
# Check AWS CLI
aws --version
# Should show: aws-cli/2.x.x

# Check SAM CLI
sam --version
# Should show: SAM CLI, version x.x.x

# Check Python
python3 --version
# Should show: Python 3.12.x

# Check Node.js
node --version
# Should show: v18.x.x or higher
```

## Step 2: Configure AWS Credentials for eu-central-1

```bash
# Option A: Using AWS CLI configuration
aws configure --profile naija-lotto
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Enter: Region: eu-central-1
# Enter: Output format: json

# Then set the profile
export AWS_PROFILE=naija-lotto

# Option B: Using environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=eu-central-1
```

## Step 3: Enable Bedrock Model Access

1. Login to AWS Console
2. Go to **Bedrock** → **Model access** (eu-central-1 region)
3. Click "Manage model access"
4. Find "Anthropic Claude 3.5 Sonnet" 
5. Check the checkbox and save
6. Wait for status to change to "Access granted"

## Step 4: Build the Application

```bash
cd /workspaces/Naija_Lotto_Oracle

# Build SAM application
sam build --region eu-central-1
```

Expected output:
```
Build Succeeded
Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml
```

## Step 5: Deploy to AWS (Choose one option)

### Option A: Fully Automated (Recommended for first deployment)

```bash
./deploy.sh
```

The script will:
- Verify AWS credentials
- Build the SAM application
- Deploy to AWS
- Display the API endpoint
- Show next steps

### Option B: Manual Deployment

```bash
# Deploy with guided setup
sam deploy --guided --region eu-central-1

# When prompted:
# Stack Name [sam-app]: naija-lotto-oracle-stack
# AWS Region [us-east-1]: eu-central-1
# Parameter Environment [prod]: prod
# Confirm changes before deploy [y/N]: y
# Allow SAM CLI to create IAM roles [Y/n]: Y
# SAM configuration will be saved to samconfig.toml
```

## Step 6: Retrieve API Endpoint

```bash
# Get all stack outputs
aws cloudformation describe-stacks \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs' \
  --output json

# Or just get the API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

echo "API Endpoint: $API_ENDPOINT"
```

## Step 7: Update Frontend Configuration

Update `aws-exports.js` with your API endpoint:

```javascript
const awsmobile = {
    // ... other config ...
    "aws_cloud_logic_custom": [
        {
            "name": "NaijaLottoOracleAPI",
            "endpoint": "https://YOUR_API_ID.execute-api.eu-central-1.amazonaws.com/prod",
            "region": "eu-central-1"
        }
    ]
};
```

## Step 8: Deploy Frontend

```bash
# Build the React app
npm run build

# You now have a 'dist' folder ready for deployment
# Deploy to: S3 + CloudFront, Amplify, Vercel, or your hosting
```

## Step 9: Test the Deployment

### Test Lambda Functions Locally (Before deploying)

```bash
# Test predictions function
sam local invoke PredictionsFunction -e events/predictions.json

# Test analysis function
sam local invoke AnalysisFunction -e events/analysis.json
```

### Test API Endpoint (After deploying)

```bash
# Get an auth token first (you'll need Cognito setup)
# For now, test without authentication to see if API responds:

API_ENDPOINT="https://YOUR_API_ID.execute-api.eu-central-1.amazonaws.com/prod"

curl -X POST "$API_ENDPOINT/predictions" \
  -H "Content-Type: application/json" \
  -d '{
    "game": "Premier Star",
    "mode": "singleYear",
    "year": 2024
  }'
```

## Step 10: Monitor Deployment

```bash
# View Lambda logs
sam logs \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1 \
  --tail

# View specific function logs
sam logs \
  -n PredictionsFunction \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1

sam logs \
  -n AnalysisFunction \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1
```

## Estimated Costs (Monthly)

| Service | Cost | Usage |
|---------|------|-------|
| Lambda | $0.20 - $5.00 | 1-1000 predictions |
| Bedrock | $0.003/1K input tokens | ~300 tokens per request |
| API Gateway | $3.50 per 1M requests | First 600K free tier |
| CloudWatch | Minimal | Free tier |
| **Total** | **$10-20/month** | Typical usage |

## Troubleshooting

### Error: "AccessDenied" when invoking Bedrock

```bash
# Check your model access
aws bedrock list-foundation-models \
  --region eu-central-1 \
  --query 'modelSummaries[?contains(modelId, `claude`)]'

# If empty, go to AWS Console and enable Bedrock access
```

### Error: "No module named boto3"

```bash
# Reinstall dependencies
rm -rf .aws-sam/build
sam build --region eu-central-1
```

### Lambda timeout or slow responses

Check CloudWatch logs:
```bash
sam logs -n PredictionsFunction --stack-name naija-lotto-oracle-stack -r eu-central-1
```

### API returns 401 Unauthorized

The API uses Cognito authorization. Either:
1. Add an auth token to the request header
2. Or remove Cognito requirement from template.yaml (for development)

## Next Steps

1. ✅ Deployment complete!
2. 📊 Monitor with CloudWatch
3. 🔐 Configure Cognito properly
4. 💰 Set up billing alerts
5. 🚀 Deploy frontend to production hosting
6. 📈 Optimize Lambda memory/timeout based on metrics

## Useful Commands

```bash
# View deployed stack status
aws cloudformation describe-stacks \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1

# Update stack (after code changes)
sam deploy --region eu-central-1 --no-confirm-changeset

# Delete entire stack and all resources
aws cloudformation delete-stack \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1

# View real-time logs (tail)
sam logs \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1 \
  --tail
```

## Support

For issues:
1. Check CloudWatch logs: `sam logs --stack-name naija-lotto-oracle-stack -r eu-central-1`
2. Verify Bedrock model access in AWS Console
3. Ensure all prerequisites are met
4. Check IAM permissions for your AWS user

---

**Ready to deploy?** Run: `./deploy.sh`
