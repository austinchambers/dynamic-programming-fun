echo "Syncing the contents with S3"
echo "Syncing the contents with S3"
aws s3 sync --region "us-west-2" --exclude ".DS_Store" ./src s3://cs247team3
