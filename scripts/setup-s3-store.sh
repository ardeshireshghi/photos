#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if ! command -v aws > /dev/null; then
  echo "Please install aws cli"
  exit 1
fi

bucket_name="$1"
aws_region="${2:-eu-west-1}"

if [[ -z "$bucket_name" ]]; then
  echo "Please specify S3 bucket name"
  exit 1
fi

# Removes aws cli pager (make it non-interactive)
export AWS_PAGER=""

aws s3api create-bucket \
    --bucket "$bucket_name" \
    --region "$aws_region" \
    --create-bucket-configuration LocationConstraint="$aws_region" \
    --acl "public-read"

sleep 1

aws s3api put-bucket-cors --bucket "$bucket_name" --cors-configuration file://$SCRIPT_DIR/s3-cors.json
