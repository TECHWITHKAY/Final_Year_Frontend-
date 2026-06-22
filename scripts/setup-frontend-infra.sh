#!/usr/bin/env bash
# ============================================================================
# setup-frontend-infra.sh
# Bootstraps S3 and CloudFront infrastructure for CommodityGH Frontend.
# Idempotent: safe to run multiple times.
#
# Usage:
#   export S3_BUCKET_NAME="commoditygh-frontend-prod-12345" # Must be globally unique
#   export AWS_REGION="us-east-1"
#   bash scripts/setup-frontend-infra.sh
# ============================================================================

set -euo pipefail

# Ensure S3_BUCKET_NAME is set
if [ -z "${S3_BUCKET_NAME:-}" ]; then
  echo "ERROR: S3_BUCKET_NAME environment variable is required."
  echo "Please set it: export S3_BUCKET_NAME=\"your-unique-bucket-name\""
  exit 1
fi

AWS_REGION="${AWS_REGION:-$(aws configure get region || echo "us-east-1")}"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query "Account" --output text)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRA_DIR="$PROJECT_ROOT/infra"

echo "==> Configuring infrastructure for bucket: ${S3_BUCKET_NAME} in region: ${AWS_REGION} (Account: ${AWS_ACCOUNT_ID})"

# ----------------------------------------------------------------------------
# 1. Create S3 Bucket
# ----------------------------------------------------------------------------
if aws s3api head-bucket --bucket "${S3_BUCKET_NAME}" 2>/dev/null; then
  echo "  ✓ S3 Bucket already exists."
else
  echo "  Creating S3 Bucket..."
  if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3api create-bucket \
      --bucket "${S3_BUCKET_NAME}" \
      --region "${AWS_REGION}" \
      --no-cli-pager
  else
    aws s3api create-bucket \
      --bucket "${S3_BUCKET_NAME}" \
      --region "${AWS_REGION}" \
      --create-bucket-configuration LocationConstraint="${AWS_REGION}" \
      --no-cli-pager
  fi
  echo "  ✓ S3 Bucket created."
fi

# Enable Versioning
echo "  Enabling S3 bucket versioning..."
aws s3api put-bucket-versioning \
  --bucket "${S3_BUCKET_NAME}" \
  --versioning-configuration Status=Enabled \
  --no-cli-pager

# Block Public Access at bucket level
echo "  Blocking all public access at bucket level..."
aws s3api put-public-access-block \
  --bucket "${S3_BUCKET_NAME}" \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
  --no-cli-pager

# ----------------------------------------------------------------------------
# 2. CloudFront Origin Access Control (OAC)
# ----------------------------------------------------------------------------
OAC_NAME="commoditygh-frontend-oac"
echo "  Checking CloudFront Origin Access Control (OAC)..."

OAC_ID=$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${OAC_NAME}'].Id" \
  --output text \
  --no-cli-pager)

if [ -z "$OAC_ID" ] || [ "$OAC_ID" = "None" ]; then
  echo "  Creating CloudFront OAC..."
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config "Name=${OAC_NAME},Description=OAC for S3 frontend bucket,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" \
    --query "OriginAccessControl.Id" \
    --output text \
    --no-cli-pager)
  echo "  ✓ CloudFront OAC created: ${OAC_ID}"
else
  echo "  ✓ CloudFront OAC exists: ${OAC_ID}"
fi

# ----------------------------------------------------------------------------
# 3. Create or Get CloudFront Distribution
# ----------------------------------------------------------------------------
DIST_COMMENT="CommodityGH Frontend — S3 + OAC"
echo "  Checking CloudFront Distribution..."

DIST_DATA=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='${DIST_COMMENT}'].{Id:Id,DomainName:DomainName}" \
  --output json \
  --no-cli-pager)

DIST_ID=$(echo "$DIST_DATA" | grep -o '"Id": "[^"]*' | grep -o '[^"]*$' || true)
DIST_DOMAIN=$(echo "$DIST_DATA" | grep -o '"DomainName": "[^"]*' | grep -o '[^"]*$' || true)

if [ -z "$DIST_ID" ]; then
  echo "  CloudFront distribution does not exist. Creating..."
  
  # Ensure target directory for temporary config exists
  TEMP_DIR="$PROJECT_ROOT/tmp"
  mkdir -p "$TEMP_DIR"
  
  # Replace placeholders in distribution template
  TEMP_DIST_CONFIG="$TEMP_DIR/cf-dist-config.json"
  sed -e "s|<BUCKET_NAME>|${S3_BUCKET_NAME}|g" \
      -e "s|<REGION>|${AWS_REGION}|g" \
      -e "s|<OAC_ID>|${OAC_ID}|g" \
      "$INFRA_DIR/cloudfront-distribution.json" > "$TEMP_DIST_CONFIG"

  # Strip out comment fields because AWS CLI validate-json will reject them
  # Use a temporary file to do so safely
  grep -v '_comment_' "$TEMP_DIST_CONFIG" > "$TEMP_DIST_CONFIG.clean"

  echo "  Applying configuration to CloudFront..."
  CREATE_OUTPUT=$(aws cloudfront create-distribution \
    --distribution-config file://"$TEMP_DIST_CONFIG.clean" \
    --no-cli-pager)
  
  DIST_ID=$(echo "$CREATE_OUTPUT" | grep -o '"Id": "[^"]*' | head -n 1 | grep -o '[^"]*$' || true)
  DIST_DOMAIN=$(echo "$CREATE_OUTPUT" | grep -o '"DomainName": "[^"]*' | head -n 1 | grep -o '[^"]*$' || true)
  
  # Cleanup temp files
  rm -f "$TEMP_DIST_CONFIG" "$TEMP_DIST_CONFIG.clean"
  
  echo "  ✓ CloudFront Distribution created successfully."
else
  echo "  ✓ CloudFront Distribution exists."
fi

# ----------------------------------------------------------------------------
# 4. S3 Bucket Policy
# ----------------------------------------------------------------------------
echo "  Applying S3 Bucket Policy..."
TEMP_POLICY="$PROJECT_ROOT/tmp/s3-policy.json"
mkdir -p "$(dirname "$TEMP_POLICY")"

sed -e "s|<BUCKET_NAME>|${S3_BUCKET_NAME}|g" \
    -e "s|<ACCOUNT_ID>|${AWS_ACCOUNT_ID}|g" \
    -e "s|<DISTRIBUTION_ID>|${DIST_ID}|g" \
    "$INFRA_DIR/s3-bucket-policy.json" > "$TEMP_POLICY"

aws s3api put-bucket-policy \
  --bucket "${S3_BUCKET_NAME}" \
  --policy file://"$TEMP_POLICY" \
  --no-cli-pager

rm -f "$TEMP_POLICY"
echo "  ✓ S3 Bucket Policy applied."

# ----------------------------------------------------------------------------
# 5. Output Results
# ----------------------------------------------------------------------------
echo "=========================================================================="
echo "  CommodityGH Frontend Infrastructure Setup Complete"
echo "=========================================================================="
echo "  S3 Bucket:             ${S3_BUCKET_NAME}"
echo "  CloudFront Domain:     https://${DIST_DOMAIN}"
echo "  CloudFront Dist ID:    ${DIST_ID}"
echo "=========================================================================="
