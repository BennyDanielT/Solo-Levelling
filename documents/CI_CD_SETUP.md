# CI/CD & Azure Deployment - Quick Start Guide
## Step 1: Spin up the Azure Infrastructure
.\scripts\setup-azure.ps1

## Step 2: Push the new passwords and credentials to GitHub
.\scripts\set-github-secrets.ps1

## Step 3: Trigger the GitHub deployment
gh workflow run deploy-azure.yml

## 🎯 Overview

Your Solo Leveling application is now configured for automated deployment to Azure Container Apps with GitHub Actions CI/CD pipeline.

## 📁 Files Created

### CI/CD Pipeline
- **`.github/workflows/deploy-azure.yml`** - GitHub Actions workflow for automated deployment

### Docker Images
- **`Dockerfile.mongodb`** - MongoDB container configuration
- **`Dockerfile.fastapi`** - FastAPI backend container
- **`Dockerfile`** - Next.js frontend container (already exists)

### Setup & Documentation
- **`scripts/setup-azure.sh`** - Automated Azure infrastructure setup script
- **`AZURE_DEPLOYMENT.md`** - Comprehensive deployment guide
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step deployment checklist
- **`.env.azure.template`** - Environment variables template

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Azure Infrastructure

```bash
# Login to Azure
az login

# Run automated setup
./scripts/setup-azure.sh

# Save all output - you'll need it for GitHub secrets
```

This creates:
- Resource Group
- Azure Container Registry
- Container Apps Environment
- Log Analytics Workspace

### Step 2: Configure GitHub Secrets

Go to your GitHub repo: **Settings > Secrets and variables > Actions**

Add these **14 secrets** (get values from setup script output):

```
Infrastructure (6):
- AZURE_RESOURCE_GROUP
- AZURE_CONTAINER_APP_ENVIRONMENT  
- AZURE_CONTAINER_REGISTRY
- ACR_USERNAME
- ACR_PASSWORD
- AZURE_CREDENTIALS

Database (3):
- MONGO_ROOT_USERNAME
- MONGO_ROOT_PASSWORD
- MONGODB_URL

Authentication (2):
- NEXTAUTH_SECRET
- NEXTAUTH_URL

OAuth (2):
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

APIs (1):
- NEWS_API_KEY
```

### Step 3: Deploy

```bash
# Push to trigger deployment
git add .
git commit -m "Deploy to Azure"
git push origin main
```

GitHub Actions will automatically:
1. Build 3 Docker images (MongoDB, FastAPI, Next.js)
2. Push to Azure Container Registry
3. Deploy to Azure Container Apps
4. Configure networking between services

## 🔍 Monitor Deployment

### Watch GitHub Actions
- Go to **Actions** tab in GitHub
- Monitor workflow progress
- Check logs if any step fails

### Check Azure Resources
```bash
# List deployed containers
az containerapp list --resource-group solo-leveling-rg -o table

# Get application URL
az containerapp show \
  --name solo-leveling-nextjs \
  --resource-group solo-leveling-rg \
  --query properties.configuration.ingress.fqdn -o tsv
```

### View Logs
```bash
# Next.js logs
az containerapp logs show --name solo-leveling-nextjs --resource-group solo-leveling-rg --follow

# FastAPI logs
az containerapp logs show --name solo-leveling-fastapi --resource-group solo-leveling-rg --follow

# MongoDB logs
az containerapp logs show --name solo-leveling-mongodb --resource-group solo-leveling-rg --follow
```

## ⚙️ Post-Deployment

### Update OAuth Redirect URLs

After first deployment, get your app URL and update:

**Google Cloud Console** (APIs & Services > Credentials):
```
https://[your-app].azurecontainerapps.io/api/auth/callback/google
```

### Test Your Application

Visit your app URL and verify:
- ✅ Application loads
- ✅ Email/password login works
- ✅ Google OAuth works
- ✅ Dashboard displays correctly
- ✅ Stock prices load
- ✅ News articles load
- ✅ Goals CRUD works
- ✅ Analytics page works

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│   Azure Container Apps Environment      │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Next.js  │─▶│ FastAPI  │─▶│MongoDB ││
│  │(External)│  │(Internal)│  │(Internal)││
│  │Port: 3000│  │Port: 8000│  │Port:27017││
│  └──────────┘  └──────────┘  └────────┘│
│                                          │
│  Auto-scaling: 1-5 replicas              │
└─────────────────────────────────────────┘
         ▲
         │
    ┌────┴─────┐
    │   ACR    │ (Container Registry)
    └──────────┘
         ▲
         │
    ┌────┴─────┐
    │  GitHub  │ (CI/CD)
    │ Actions  │
    └──────────┘
```

## 💰 Costs

**Estimated Monthly:**
- Container Apps: $30-50
- Container Registry: $5
- Log Analytics: $5-10
- **Total: ~$40-65/month**

### Cost Optimization
```bash
# Scale to zero during low traffic
az containerapp update --name solo-leveling-nextjs --min-replicas 0

# Monitor costs in Azure Portal
# Set up budget alerts at 50%, 80%, 100%
```

## 🔧 Useful Commands

```bash
# Restart container
az containerapp update --name solo-leveling-nextjs --resource-group solo-leveling-rg

# Scale manually
az containerapp update \
  --name solo-leveling-nextjs \
  --resource-group solo-leveling-rg \
  --min-replicas 2 --max-replicas 10

# View metrics
az monitor metrics list \
  --resource /subscriptions/.../resourceGroups/solo-leveling-rg/providers/Microsoft.App/containerApps/solo-leveling-nextjs

# Rollback to previous version
az containerapp revision list --name solo-leveling-nextjs --resource-group solo-leveling-rg -o table
az containerapp revision activate --revision [previous-revision-name]

# Delete everything
az group delete --name solo-leveling-rg --yes --no-wait
```

## 🐛 Troubleshooting

### Container won't start
```bash
# Check status
az containerapp show --name solo-leveling-nextjs --resource-group solo-leveling-rg \
  --query "properties.{Status:provisioningState, Health:healthState}"

# Check logs
az containerapp logs show --name solo-leveling-nextjs --resource-group solo-leveling-rg --tail 100
```

### Database connection fails
```bash
# Verify MongoDB is running
az containerapp show --name solo-leveling-mongodb --resource-group solo-leveling-rg

# Check environment variables
az containerapp show --name solo-leveling-fastapi --resource-group solo-leveling-rg \
  --query "properties.template.containers[0].env"
```

### OAuth not working
- Verify callback URLs match your deployment URL exactly
- Check OAuth credentials in GitHub secrets
- Review FastAPI logs for auth errors

## 📚 Documentation

- **Full Guide**: `AZURE_DEPLOYMENT.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Environment Variables**: `.env.azure.template`

## 🎉 Next Steps

1. **Custom Domain**: Configure your own domain
```bash
az containerapp hostname add \
  --name solo-leveling-nextjs \
  --resource-group solo-leveling-rg \
  --hostname yourdomain.com
```

2. **Monitoring**: Set up Azure Monitor alerts for:
   - High CPU/memory usage
   - HTTP errors
   - Container restarts

3. **CDN**: Add Azure Front Door for:
   - Global content delivery
   - DDoS protection
   - WAF (Web Application Firewall)

4. **Backups**: Configure MongoDB backup strategy

5. **SSL**: Automatically handled by Azure Container Apps

## 🆘 Support

- Azure Container Apps Docs: https://learn.microsoft.com/azure/container-apps/
- GitHub Actions: https://docs.github.com/actions
- Issues: Open an issue in your repository

---

## Summary

You now have:
- ✅ Automated CI/CD pipeline with GitHub Actions
- ✅ Three containerized services in Azure
- ✅ Auto-scaling configured (1-5 replicas)
- ✅ Internal service networking
- ✅ HTTPS enabled by default
- ✅ Monitoring and logging via Log Analytics
- ✅ Easy rollback capabilities
- ✅ Zero-downtime deployments

**Ready to deploy? Start with Step 1! 🚀**
