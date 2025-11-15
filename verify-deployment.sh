#!/bin/bash

# Naija Lotto Oracle - Deployment Verification Script
# Checks all prerequisites and configurations before deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Naija Lotto Oracle - Deployment Verification Script     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Counter for checks
PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# ============================================================================
echo -e "${BLUE}Checking Prerequisites...${NC}"
echo ""

# Check AWS CLI
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    check_pass "AWS CLI installed: $AWS_VERSION"
else
    check_fail "AWS CLI not installed"
fi

# Check SAM CLI
if command -v sam &> /dev/null; then
    SAM_VERSION=$(sam --version)
    check_pass "SAM CLI installed: $SAM_VERSION"
else
    check_fail "SAM CLI not installed"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not installed"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    check_pass "Python 3 installed: $PYTHON_VERSION"
else
    check_fail "Python 3 not installed"
fi

# Check Git
if command -v git &> /dev/null; then
    check_pass "Git installed"
else
    check_fail "Git not installed"
fi

echo ""
echo -e "${BLUE}Checking AWS Configuration...${NC}"
echo ""

# Check AWS credentials
if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    check_pass "AWS Credentials configured"
    echo "  Account ID: $ACCOUNT_ID"
    echo "  User: $USER_ARN"
else
    check_fail "AWS Credentials not configured"
fi

# Check default region
AWS_REGION=${AWS_DEFAULT_REGION:-$(aws configure get region)}
if [ "$AWS_REGION" == "eu-central-1" ]; then
    check_pass "Region set to eu-central-1"
else
    check_warn "Region is $AWS_REGION (should be eu-central-1)"
fi

echo ""
echo -e "${BLUE}Checking Project Structure...${NC}"
echo ""

# Check key files
FILES=(
    "template.yaml"
    "services/aiService.ts"
    "backend/predictions/app.py"
    "backend/analysis/app.py"
    "package.json"
    "index.tsx"
    "deploy.sh"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Found: $file"
    else
        check_fail "Missing: $file"
    fi
done

echo ""
echo -e "${BLUE}Checking Build Artifacts...${NC}"
echo ""

# Check SAM build
if [ -d ".aws-sam/build" ]; then
    check_pass "SAM build artifacts exist"
else
    check_warn "SAM build artifacts not found (run 'sam build')"
fi

# Check frontend build
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    check_pass "Frontend build exists (size: $DIST_SIZE)"
else
    check_warn "Frontend build not found (run 'npm run build')"
fi

echo ""
echo -e "${BLUE}Checking Configuration...${NC}"
echo ""

# Check aws-exports.js
if grep -q "execute-api.eu-central-1.amazonaws.com" aws-exports.js; then
    check_pass "aws-exports.js configured for eu-central-1"
else
    check_warn "aws-exports.js might need API endpoint update"
fi

# Check template.yaml for correct runtime
if grep -q "Runtime: python3.12" template.yaml; then
    check_pass "Lambda runtime set to Python 3.12"
else
    check_warn "Lambda runtime might not be Python 3.12"
fi

# Check Bedrock model
if grep -q "claude-3-5-sonnet-20241022" template.yaml; then
    check_pass "Bedrock Claude 3.5 Sonnet model configured"
else
    check_fail "Bedrock model not properly configured"
fi

echo ""
echo -e "${BLUE}Checking Dependencies...${NC}"
echo ""

# Check npm dependencies
if [ -d "node_modules" ]; then
    check_pass "Node.js dependencies installed"
else
    check_warn "Node.js dependencies not installed (run 'npm install')"
fi

# Check Python dependencies
if [ -f "backend/predictions/requirements.txt" ]; then
    check_pass "Python dependencies file exists (predictions)"
else
    check_fail "Missing: backend/predictions/requirements.txt"
fi

if [ -f "backend/analysis/requirements.txt" ]; then
    check_pass "Python dependencies file exists (analysis)"
else
    check_fail "Missing: backend/analysis/requirements.txt"
fi

echo ""
echo -e "${BLUE}Checking Documentation...${NC}"
echo ""

DOCS=(
    "README.md"
    "QUICKSTART.md"
    "DEPLOYMENT.md"
    "DEPLOYMENT_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "Documentation: $doc"
    else
        check_fail "Missing documentation: $doc"
    fi
done

# ============================================================================
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
else
    echo -e "${GREEN}Failed: 0${NC}"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo -e "${YELLOW}To deploy:${NC}"
    echo "  ./deploy.sh"
    echo ""
    echo -e "${YELLOW}To test locally:${NC}"
    echo "  sam local invoke PredictionsFunction -e events/predictions.json"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some critical checks failed!${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the failed items before deploying.${NC}"
    echo ""
    exit 1
fi
