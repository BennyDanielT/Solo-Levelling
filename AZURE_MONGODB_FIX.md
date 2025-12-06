# Azure Container Apps MongoDB Connection Fix

## Problem
FastAPI container couldn't connect to MongoDB container via Azure Container Apps internal networking.

## Error
```
pymongo.errors.ServerSelectionTimeoutError: <hostname>:27017: timed out
```

## Root Cause
PyMongo was attempting replica set discovery, which doesn't work well with Azure Container Apps TCP-based internal ingress.

## Solution
Add `directConnection=true` parameter to MongoDB connection string:

```
mongodb://admin:password@solo-leveling-mongodb:27017/dbname?authSource=admin&directConnection=true
```

## Key Parameters
- **Short hostname**: Use `solo-leveling-mongodb` instead of full FQDN
- **directConnection=true**: Bypasses replica set discovery
- **authSource=admin**: Specifies authentication database
- **TCP ingress**: MongoDB uses internal TCP transport on port 27017

## Deployment Configuration
- MongoDB: Internal ingress, TCP transport, port 27017
- FastAPI: Internal ingress, HTTP transport, port 8000  
- Next.js: External ingress, HTTP transport, port 3000

All services communicate via internal networking within the same Container Apps Environment.

## Status
✅ **RESOLVED** - Connection established successfully with directConnection parameter
