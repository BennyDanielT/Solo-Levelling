# Azure Container Apps Deployment Checklist

Use this checklist to ensure a smooth deployment to Azure.

## Pre-Deployment

### 1. Azure Account Setup
- [ ] Azure subscription is active
- [ ] Azure CLI installed (`az --version`)
- [ ] Logged into Azure CLI (`az login`)
- [ ] Correct subscription selected (`az account set --subscription <id>`)

### 2. Local Testing
- [ ] Application runs locally with Docker Compose
- [ ] All services communicate correctly
- [ ] Database connections work
- [ ] OAuth flows tested
- [ ] API endpoints responding

### 3. Environment Variables
- [ ] All secrets generated (use commands in `.env.azure.template`)
- [ ] OAuth redirect URIs configured
- [ ] NewsAPI key obtained
- [ ] MongoDB credentials generated

## Azure Infrastructure Setup

### 4. Run Setup Script
- [ ] Made setup script executable: `chmod +x scripts/setup-azure.sh`
- [ ] Executed setup script: `./scripts/setup-azure.sh`
- [ ] Saved all output values
- [ ] Service principal created successfully

### 5. Verify Azure Resources
- [ ] Resource group created: `solo-leveling-rg`
- [ ] Container registry created: `sololevelingacr`
- [ ] Container Apps environment created: `solo-leveling-env`
- [ ] Log Analytics workspace created

```bash
# Verify resources
az group show --name solo-leveling-rg
az acr show --name sololevelingacr
az containerapp env show --name solo-leveling-env --resource-group solo-leveling-rg
```

## GitHub Configuration

### 6. Configure GitHub Secrets
Go to: **Repository Settings > Secrets and variables > Actions > New repository secret**

#### Azure Infrastructure (6 secrets)
- [ ] `AZURE_RESOURCE_GROUP` = solo-leveling-rg
- [ ] `AZURE_CONTAINER_APP_ENVIRONMENT` = solo-leveling-env
- [ ] `AZURE_CONTAINER_REGISTRY` = sololevelingacr.azurecr.io
- [ ] `ACR_USERNAME` = (from ACR credentials)
- [ ] `ACR_PASSWORD` = (from ACR credentials)
- [ ] `AZURE_CREDENTIALS` = (full JSON from service principal)

#### Database (3 secrets)
- [ ] `MONGO_ROOT_USERNAME` = admin (or your choice)
- [ ] `MONGO_ROOT_PASSWORD` = (strong password)
- [ ] `MONGODB_URL` = mongodb://username:password@solo-leveling-mongodb:27017/solo_leveling?authSource=admin

#### Authentication (3 secrets)
- [ ] `NEXTAUTH_SECRET` = (32 char hex: `openssl rand -hex 32`)
- [ ] `NEXTAUTH_URL` = https://solo-leveling-nextjs.azurecontainerapps.io

#### OAuth Providers (2 secrets)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

#### External APIs (1 secret)
- [ ] `NEWS_API_KEY`

**Total: 15 secrets**

### 7. Verify Secrets
```bash
# List all secrets (names only)
gh secret list
```

## Deployment

### 8. Initial Deployment
- [ ] Committed all changes to repository
- [ ] Pushed to main branch
- [ ] GitHub Actions workflow triggered
- [ ] Workflow completed successfully

```bash
git add .
git commit -m "Configure Azure Container Apps deployment"
git push origin main
```

### 9. Monitor Deployment
- [ ] Check GitHub Actions tab for workflow progress
- [ ] Review workflow logs for errors
- [ ] Verify all three containers deployed

```bash
# Or monitor via Azure CLI
az containerapp list --resource-group solo-leveling-rg -o table
```

## Post-Deployment Verification

### 10. Get Application URLs
```bash
# Get Next.js app URL
az containerapp show \
  --name solo-leveling-nextjs \
  --resource-group solo-leveling-rg \
  --query properties.configuration.ingress.fqdn -o tsv

# Get FastAPI URL (internal)
az containerapp show \
  --name solo-leveling-fastapi \
  --resource-group solo-leveling-rg \
  --query properties.configuration.ingress.fqdn -o tsv
```

### 11. Update OAuth Callback URLs
Update redirect URIs in OAuth provider settings:

#### Google Cloud Console
- [ ] Navigate to: APIs & Services > Credentials
- [ ] Edit OAuth 2.0 Client
- [ ] Add redirect URI: `https://[your-app].azurecontainerapps.io/api/auth/callback/google`
- [ ] Save changes

### 12. Test Application
- [ ] Application loads in browser
- [ ] Sign in with email/password works
- [ ] Sign in with Google works
- [ ] Dashboard loads correctly
- [ ] Stock prices fetching
- [ ] News articles loading
- [ ] Goals CRUD operations work
- [ ] Analytics page displays

### 13. Verify Container Health
```bash
# Check all container statuses
az containerapp list \
  --resource-group solo-leveling-rg \
  --query "[].{Name:name, Status:properties.provisioningState, Health:properties.healthState}" \
  -o table

# Check logs
az containerapp logs show --name solo-leveling-nextjs --resource-group solo-leveling-rg --tail 50
az containerapp logs show --name solo-leveling-fastapi --resource-group solo-leveling-rg --tail 50
az containerapp logs show --name solo-leveling-mongodb --resource-group solo-leveling-rg --tail 50
```

### 14. Database Verification
- [ ] MongoDB container running
- [ ] Collections created (users, goals, achievements)
- [ ] Test user can be created
- [ ] Data persists across requests

```bash
# Exec into MongoDB container
az containerapp exec \
  --name solo-leveling-mongodb \
  --resource-group solo-leveling-rg \
  --command "mongo -u admin -p <password> --eval 'db.adminCommand({listDatabases: 1})'"
```

## Monitoring Setup

### 15. Configure Monitoring
- [ ] Access Log Analytics workspace in Azure Portal
- [ ] Review application insights
- [ ] Set up alert rules for:
  - [ ] High CPU usage (>80%)
  - [ ] High memory usage (>80%)
  - [ ] Container restart events
  - [ ] HTTP 5xx errors
  - [ ] Response time degradation

### 16. Set Up Cost Alerts
- [ ] Navigate to: Cost Management + Billing
- [ ] Create budget with alerts at:
  - [ ] 50% of monthly budget
  - [ ] 80% of monthly budget
  - [ ] 100% of monthly budget

## Documentation

### 17. Document Deployment
- [ ] Save application URLs in documentation
- [ ] Document any custom configurations
- [ ] Update README with deployment info
- [ ] Share access credentials securely

### 18. Team Onboarding
- [ ] Add team members to Azure resource group
- [ ] Configure GitHub repository access
- [ ] Share deployment documentation
- [ ] Review monitoring dashboards

## Scaling & Optimization

### 19. Review Scaling Settings
```bash
# Check current scaling configuration
az containerapp show \
  --name solo-leveling-nextjs \
  --resource-group solo-leveling-rg \
  --query "properties.template.scale"
```

- [ ] Min/max replicas configured appropriately
- [ ] Scale rules tested under load
- [ ] Auto-scaling triggers verified

### 20. Performance Optimization
- [ ] Enable CDN for static assets (optional)
- [ ] Configure custom domain (optional)
- [ ] Enable SSL certificate
- [ ] Review container resource limits

## Disaster Recovery

### 21. Backup Strategy
- [ ] MongoDB backup strategy defined
- [ ] Container images stored in ACR
- [ ] Critical secrets backed up securely
- [ ] Deployment scripts version controlled

### 22. Rollback Plan
- [ ] Document rollback procedure
- [ ] Test rolling back to previous revision
- [ ] Verify data migration compatibility

```bash
# Practice rollback
az containerapp revision list \
  --name solo-leveling-nextjs \
  --resource-group solo-leveling-rg \
  -o table
```

## Maintenance

### 23. Regular Updates
- [ ] Schedule dependency updates
- [ ] Monitor security advisories
- [ ] Plan for infrastructure updates
- [ ] Review and optimize costs monthly

### 24. Monitoring Routine
- [ ] Daily: Check application health
- [ ] Weekly: Review logs and metrics
- [ ] Monthly: Analyze costs and optimize
- [ ] Quarterly: Review scaling needs

## Troubleshooting

### Common Issues Checklist
- [ ] Container won't start → Check logs and environment variables
- [ ] Database connection fails → Verify MONGODB_URL and networking
- [ ] OAuth not working → Verify callback URLs match deployment URL
- [ ] 502/503 errors → Check container health and resource limits
- [ ] Slow performance → Review scaling settings and resource allocation

## Sign-Off

### Deployment Complete
- [ ] All checklist items completed
- [ ] Application accessible and functional
- [ ] Monitoring and alerts configured
- [ ] Documentation updated
- [ ] Team notified

**Deployed by:** _________________  
**Date:** _________________  
**Application URL:** _________________  
**Deployment Notes:** _________________

---

## Quick Commands Reference

```bash
# View all resources
az resource list --resource-group solo-leveling-rg -o table

# Stream logs
az containerapp logs show --name solo-leveling-nextjs --resource-group solo-leveling-rg --follow

# Restart container
az containerapp update --name solo-leveling-nextjs --resource-group solo-leveling-rg

# Scale manually
az containerapp update --name solo-leveling-nextjs --resource-group solo-leveling-rg --min-replicas 2 --max-replicas 10

# Delete all resources
az group delete --name solo-leveling-rg --yes --no-wait
```
