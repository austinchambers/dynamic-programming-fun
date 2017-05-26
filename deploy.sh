echo "Syncing the contents with S3"
aws s3 sync --region "us-west-2" --exclude ".DS_Store"  --exclude ".git" . s3://dp.dignata.net
