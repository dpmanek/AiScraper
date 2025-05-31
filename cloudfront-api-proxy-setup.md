# Setting Up CloudFront as an API Proxy

This guide will help you configure your CloudFront distribution to proxy API requests to your EC2 instance.

## Step 1: Add a New Origin to Your CloudFront Distribution

1. Go to the AWS Management Console
2. Navigate to CloudFront
3. Select your distribution (d1v9dmgp4scf60.cloudfront.net)
4. Go to the "Origins" tab
5. Click "Create Origin"
6. Fill in the following details:
   - **Origin Domain**: Your EC2 instance public DNS or IP (184.72.168.62:5000)
   - **Protocol**: HTTP only (since your EC2 doesn't have HTTPS yet)
   - **Origin Path**: Leave empty
   - **Name**: `ec2-backend` (or any name you prefer)
   - **Enable Origin Shield**: No
   - **Additional settings**:
     - **Origin connection attempts**: 3
     - **Origin connection timeout**: 10 seconds
     - **Origin response timeout**: 30 seconds
     - **Keep-alive timeout**: 5 seconds
7. Click "Create Origin"

## Step 2: Create Policies for API Requests

### Step 2.1: Create a Cache Policy

1. Go to the CloudFront console
2. Click on "Policies" in the left navigation
3. Select the "Cache policies" tab
4. Click "Create cache policy"
5. Fill in the following details:
   - **Name**: `APINoCache`
   - **Description**: `Disable caching for API requests`
   - **Policy settings**:
     - **Minimum TTL**: 0
     - **Maximum TTL**: 0
     - **Default TTL**: 0
   - **Cache key settings**:
     - **Headers**: None (important: do not select any headers here)
     - **Query strings**: All
     - **Cookies**: All
   - **Compression support**: Enable Gzip and Brotli
6. Click "Create"

### Step 2.2: Create an Origin Request Policy

1. Stay in the "Policies" section of the CloudFront console
2. Select the "Origin request policies" tab
3. Click "Create origin request policy"
4. Fill in the following details:
   - **Name**: `AllViewerHeaders`
   - **Description**: `Forward all viewer headers to origin`
   - **Origin request settings**:
     - **Headers**: All viewer headers
     - **Query strings**: All
     - **Cookies**: All
5. Click "Create"

### Step 2.3: Create a Behavior for API Requests

1. Go back to your CloudFront distribution
2. Go to the "Behaviors" tab
3. Click "Create Behavior"
4. Fill in the following details:
   - **Path pattern**: `/api/*` (this will match all API requests)
   - **Origin**: Select the EC2 origin you created in Step 1
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache key and origin requests**:
     - **Cache policy**: Select the `APINoCache` policy you created
     - **Origin request policy**: Select the `AllViewerHeaders` policy you created
5. Click "Create Behavior"

## Step 3: Update Your EC2 Security Group

Make sure your EC2 security group allows inbound traffic from CloudFront IP ranges:

1. Go to EC2 in the AWS Console
2. Select your instance
3. Click on the Security tab
4. Click on the Security Group
5. Edit inbound rules
6. Add a rule:
   - Type: Custom TCP
   - Port range: 5000
   - Source: Anywhere-IPv4 (0.0.0.0/0) or you can use CloudFront IP ranges for better security

## Step 4: Invalidate CloudFront Cache (Optional)

After making these changes, you might want to invalidate your CloudFront cache:

1. Go to your CloudFront distribution
2. Go to the "Invalidations" tab
3. Click "Create Invalidation"
4. Enter `/*` to invalidate everything
5. Click "Create Invalidation"

## Step 5: Test Your Setup

1. Wait for the CloudFront distribution to deploy the changes (Status: Deployed)
2. Try accessing your application at https://d1v9dmgp4scf60.cloudfront.net
3. The frontend should now be able to make API calls without mixed content errors

## Troubleshooting

If you're still experiencing issues:

1. Check CloudFront logs for any errors
2. Verify that your EC2 instance is accepting connections on port 5000
3. Make sure your Node.js server is running on the EC2 instance
4. Check that the API paths in your frontend code match the expected format with the new base URL
