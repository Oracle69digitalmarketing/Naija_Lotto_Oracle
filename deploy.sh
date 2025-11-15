#!/bin/bash

# Naija Lotto Oracle - AWS SAM Deployment Script
# This script automates the deployment of the full stack to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION="eu-central-1"
STACK_NAME="naija-lotto-oracle-stack"
ENVIRONMENT="prod"

echo -e "${YELLOW}Naija Lotto Oracle - AWS SAM Deployment${NC}"
echo "========================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo -e "${RED}❌ SAM CLI is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI and SAM CLI are installed${NC}"

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity --region $REGION > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS credentials are not configured or invalid.${NC}"
    echo "Please run: aws configure --profile <profile-name>"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials are valid${NC}"

# Get account ID and show user info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
USER_INFO=$(aws sts get-caller-identity --query Arn --output text)
echo "Account ID: $ACCOUNT_ID"
echo "User: $USER_INFO"

# Build the SAM application
echo ""
echo -e "${YELLOW}Building SAM application...${NC}"
sam build --region $REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SAM build completed successfully${NC}"
else
    echo -e "${RED}❌ SAM build failed${NC}"
    exit 1
fi

# Check if stack exists
echo ""
echo -e "${YELLOW}Checking if stack exists...${NC}"
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].StackName' \
    --output text 2>/dev/null || echo "")

if [ -z "$STACK_EXISTS" ]; then
    echo "Stack does not exist. Creating new stack..."
    DEPLOY_ACTION="create"
else
    echo "Stack exists. Updating existing stack..."
    DEPLOY_ACTION="update"
fi

# Deploy the SAM application
echo ""
echo -e "${YELLOW}Deploying SAM application to AWS...${NC}"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo ""

sam deploy \
    --region $REGION \
    --stack-name $STACK_NAME \
    --resolve-s3 \
    --parameter-overrides Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SAM deployment completed successfully${NC}"
else
    echo -e "${RED}❌ SAM deployment failed${NC}"
    exit 1
fi

# Get stack outputs
echo ""
echo -e "${YELLOW}Retrieving stack outputs...${NC}"
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output json)

echo -e "${GREEN}Stack Outputs:${NC}"
echo "$OUTPUTS" | jq '.'

# Extract API endpoint
API_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')

if [ ! -z "$API_ENDPOINT" ]; then
    echo ""
    echo -e "${GREEN}✓ API Endpoint: $API_ENDPOINT${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update aws-exports.js with your API endpoint"
    echo "2. Run 'npm run build' to build the frontend"
    echo "3. Deploy the dist/ folder to your hosting service"
else
    echo -e "${RED}❌ Could not retrieve API endpoint${NC}"
fi

echo ""
echo -e "${GREEN}✓ Deployment completed!${NC}"
echo ""
echo "To view logs:"
echo "  sam logs -n PredictionsFunction --stack-name $STACK_NAME -r $REGION"
echo "  sam logs -n AnalysisFunction --stack-name $STACK_NAME -r $REGION"
echo ""
echo "To delete the stack:"
echo "  aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION"
