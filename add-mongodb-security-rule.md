# MongoDB Connection Issue - Security Group Fix

I've identified the issue with your MongoDB connection. Looking at the security group rules for your MongoDB EC2 instance, I can see that it's only allowing connections on port 27017 from itself (3.85.239.7/32), but not from your application server or CloudFront.

## The Problem

Your MongoDB server security group has these inbound rules for port 27017:

- Allow from 3.85.239.7/32 (the MongoDB server itself)
- Allow from 3.82.157.27/32 (possibly another server)

But it doesn't have a rule to allow connections from your application server or from CloudFront.

## The Solution

You need to add a new inbound rule to the MongoDB security group to allow traffic on port 27017 from your application server. Here's how:

1. Go to the EC2 console
2. Select the MongoDB instance (i-0797160f7e3149011)
3. Go to the "Security" tab
4. Click on the security group
5. Click "Edit inbound rules"
6. Click "Add rule"
7. Set the following values:
   - Type: Custom TCP
   - Protocol: TCP
   - Port range: 27017
   - Source: Custom
   - Enter the IP address of your application server (the one running Node.js)
   - Description: "Allow MongoDB from App Server"
8. Click "Save rules"

If you don't know the IP address of your application server, you can temporarily allow connections from anywhere (0.0.0.0/0) for testing purposes, but this is not recommended for production:

- Source: Anywhere-IPv4 (0.0.0.0/0)

## Alternative Solution

If you prefer not to modify the security group, you can use MongoDB Atlas instead by uncommenting the MongoDB Atlas connection string in your .env file:

```
# Use MongoDB Atlas for reliable cloud-hosted MongoDB
MONGODB_URI=mongodb+srv://deepmanek123:nmXlfogCgwUDHwIz@scraper.ilubimv.mongodb.net/?retryWrites=true&w=majority&appName=Scraper
# Local MongoDB instance (not working - connection issues)
# MONGODB_URI=mongodb://3.85.239.7:27017/aiscraper
```

After making either change, restart your Node.js application for the changes to take effect.
