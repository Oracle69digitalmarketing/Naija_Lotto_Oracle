<div align="center">
<img width="1200" height="475" alt="Naija Lotto Oracle" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Naija Lotto Oracle - AI-Powered Lottery Prediction System

An intelligent lottery prediction and analysis system powered by AWS Bedrock Claude Sonnet 4.5, deployed on AWS Lambda with API Gateway.

## Architecture

```
┌─────────────────┐
│   React + Vite  │ (Frontend)
└────────┬────────┘
         │
    ┌────▼─────────────────────────┐
    │    API Gateway (HTTP)         │
    │  Cognito Authentication       │
    └────┬─────────────────┬────────┘
         │                 │
    ┌────▼──────┐  ┌──────▼────┐
    │ Predictions│  │  Analysis  │
    │  Lambda    │  │  Lambda    │
    └────┬──────┘  └──────┬────┘
         │                 │
    ┌────▼─────────────────▼────┐
    │   AWS Bedrock Claude API   │
    │  (Claude 3.5 Sonnet)       │
    └────────────────────────────┘
```

## Features

- 🤖 **AI-Powered Predictions** using Claude 3.5 Sonnet
- 🎮 **Multiple Lottery Games**: Premier Star, Golden Empire, Western Star, Emerald Lotto
- 📊 **Advanced Analysis Modes**: Single Year & All-Time Analysis
- 🔐 **Secure Authentication** with AWS Cognito
- ⚡ **Serverless Backend** on AWS Lambda
- 🌍 **Global Deployment** using CloudFront CDN
- 📈 **Real-time Analytics** via CloudWatch

## Prerequisites

### For Local Development
- Node.js 18+ (for frontend)
- Python 3.12+ (for local Lambda testing)

### For AWS Deployment
- AWS Account with appropriate IAM permissions
- AWS CLI configured with eu-central-1 region
- SAM CLI (AWS Serverless Application Model)
- Bedrock access to Claude 3.5 Sonnet model

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will run at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## AWS Deployment

### Complete Deployment in One Command
```bash
./deploy.sh
```

### Manual Deployment

#### 1. Build SAM Application
```bash
sam build --region eu-central-1
```

#### 2. Deploy to AWS (Guided)
```bash
sam deploy --guided --region eu-central-1
```

When prompted:
- Stack Name: `naija-lotto-oracle-stack`
- Region: `eu-central-1`
- Let SAM create an S3 bucket for artifacts
- Confirm IAM role creation

#### 3. Get API Endpoint
```bash
aws cloudformation describe-stacks \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs' \
  --output json
```

#### 4. Update Frontend Configuration
Update `aws-exports.js` with your API endpoint:
```javascript
"aws_cloud_logic_custom": [
  {
    "name": "NaijaLottoOracleAPI",
    "endpoint": "https://<YOUR_API_ID>.execute-api.eu-central-1.amazonaws.com/prod",
    "region": "eu-central-1"
  }
]
```

#### 5. Deploy Frontend
- Build: `npm run build`
- Upload `dist/` folder to S3 or your hosting service
- Or use AWS Amplify: `amplify publish`

## Project Structure

```
Naija_Lotto_Oracle/
├── src/                          # Frontend source
│   ├── components/              # React components
│   ├── services/                # API services
│   └── types.ts                 # TypeScript types
├── backend/                     # SAM Lambda functions
│   ├── predictions/             # Predictions Lambda
│   │   ├── app.py              # Handler function
│   │   └── requirements.txt     # Python dependencies
│   └── analysis/                # Analysis Lambda
│       ├── app.py              # Handler function
│       └── requirements.txt     # Python dependencies
├── events/                      # Test events for local testing
├── template.yaml                # SAM CloudFormation template
└── deploy.sh                    # Deployment automation script
```

## Configuration

### AWS Credentials
Set your credentials via environment variables or AWS CLI:
```bash
export AWS_ACCESS_KEY_ID=<your-key>
export AWS_SECRET_ACCESS_KEY=<your-secret>
export AWS_DEFAULT_REGION=eu-central-1
```

Or use AWS profile:
```bash
aws configure --profile naija-lotto
export AWS_PROFILE=naija-lotto
```

### Bedrock Model Access
1. Go to AWS Console → Bedrock → Model Access
2. Request access to "Anthropic Claude 3.5 Sonnet"
3. Wait for approval (usually instant)

## Testing

### Local Lambda Testing
```bash
# Test predictions function
sam local invoke PredictionsFunction -e events/predictions.json

# Test analysis function
sam local invoke AnalysisFunction -e events/analysis.json
```

### API Testing with curl
```bash
# Get predictions
curl -X POST \
  https://<YOUR_API_ID>.execute-api.eu-central-1.amazonaws.com/prod/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "game": "Premier Star",
    "mode": "singleYear",
    "year": 2024
  }'
```

## Monitoring & Logs

### View Lambda Logs
```bash
sam logs -n PredictionsFunction --stack-name naija-lotto-oracle-stack -r eu-central-1

sam logs -n AnalysisFunction --stack-name naija-lotto-oracle-stack -r eu-central-1
```

### CloudWatch Dashboard
1. Go to AWS Console → CloudWatch → Dashboards
2. Look for `naija-lotto-oracle-stack` dashboard
3. Monitor:
   - Lambda invocations
   - Errors and duration
   - Bedrock API calls
   - Cost analysis

## Cost Estimation

**Monthly costs (estimated):**
- Lambda: $0.20 - $5.00 (depending on usage)
- Bedrock: $0.003 per 1K input tokens, $0.015 per 1K output tokens
- API Gateway: $3.50 per million requests
- CloudWatch: Minimal (covered by free tier)

**Example:** 1000 predictions/month = ~$10-20/month

## Troubleshooting

### Issue: "AccessDenied" from Bedrock
**Solution:**
1. Check you have Bedrock access in eu-central-1
2. Verify IAM role has `bedrock:InvokeModel` permission
3. Check model access: AWS Console → Bedrock → Model Access

### Issue: Lambda timeout
**Solution:**
1. Increase timeout in template.yaml (currently 120s)
2. Check if Bedrock API is responding
3. View logs: `sam logs -n PredictionsFunction`

### Issue: Cognito authorization fails
**Solution:**
1. Update aws-exports.js with correct Cognito configuration
2. Ensure user is signed up in the user pool
3. Check Cognito user pool settings

### Issue: Cold start delays
**Solution:**
1. Increase reserved concurrency
2. Use provisioned concurrency for production
3. Consider keeping function warm with scheduled events

## API Documentation

### POST /predictions
Generate lucky numbers for a lottery game.

**Request:**
```json
{
  "game": "Premier Star",
  "mode": "singleYear",
  "year": 2024
}
```

**Response:**
```json
{
  "predictions": [
    {"number": 7, "probability": 0.85},
    {"number": 14, "probability": 0.78}
  ],
  "analysis": "Based on historical data..."
}
```

### POST /analyze
Analyze a specific number in a lottery game.

**Request:**
```json
{
  "game": "Premier Star",
  "mode": "singleYear",
  "year": 2024,
  "number": 7
}
```

**Response:**
```json
{
  "analysis": "This number shows a hot trend...",
  "status": "Hot",
  "frequency": 45
}
```

## Development

### Adding a New Feature

1. **Frontend Component**: Add to `components/`
2. **Backend Logic**: Add to `backend/<feature>/app.py`
3. **API Endpoint**: Add to `template.yaml`
4. **Types**: Update `types.ts`
5. **Deploy**: Run `./deploy.sh`

### Updating Lambda Functions
```bash
# Make changes to backend code
vim backend/predictions/app.py

# Rebuild
sam build --region eu-central-1

# Deploy only the changed function
sam deploy --region eu-central-1
```

## Production Checklist

- [ ] Configure custom domain name
- [ ] Enable CloudFront caching
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable API Gateway logging
- [ ] Set up SNS alerts for errors
- [ ] Configure DynamoDB for caching (optional)
- [ ] Set up Lambda reserved concurrency
- [ ] Enable X-Ray tracing for debugging
- [ ] Update Cognito MFA settings
- [ ] Review IAM policies (least privilege)

## Cleanup

Delete all AWS resources:
```bash
aws cloudformation delete-stack \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name naija-lotto-oracle-stack \
  --region eu-central-1
```

## Support & Documentation

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## License

Proprietary - Oracle69digitalmarketing

## Contributors

- Oracle69digitalmarketing Team
