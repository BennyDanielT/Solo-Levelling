# 🚀 Azure Services Recovery Guide

Depending on whether you deleted the **entire Resource Group** or just stopped/deleted the **Container Apps**, here is the easiest, most automated way to bring everything back online.

---

## 🔍 Step 1: Determine What Was Deleted

Before starting, run this quick check in your terminal to see if the main resource group still exists:

```powershell
az group show --name solo-leveling-rg
```

- **If the resource group exists:** You only need to redeploy the services (Scenario A).
- **If the resource group is gone (ResourceGroupNotFound):** You need to recreate the infrastructure first (Scenario B).

---

## 🛠️ Scenario A: Resource Group & ACR Exist (Only Container Apps Deleted/Stopped)

If the base infrastructure (Resource Group, ACR, Container Apps Environment) is still there, you don't need to run any local commands! The easiest and most automated way is using your existing **GitHub Actions** workflow.

### 1. Trigger the Deployment via GitHub Actions
Since `.github/workflows/deploy-azure.yml` is configured with `workflow_dispatch`, you can trigger it manually:
1. Go to your repository on **GitHub**.
2. Click on the **Actions** tab.
3. Select the **Deploy to Azure Container Apps** workflow on the left sidebar.
4. Click the **Run workflow** dropdown on the right and select your branch (usually `main`).
5. Click the green **Run workflow** button.

> [!TIP]
> The workflow script is smart! It automatically checks if the container apps exist using `az containerapp show`. If they are missing, it will run `az containerapp create` and rebuild/deploy them from scratch.

---

## 🏗️ Scenario B: Resource Group / Infrastructure Deleted (Complete Rebuild)

If the entire resource group was deleted, you must recreate the Azure environment before deploying the services.

### 1. Recreate the Base Infrastructure
Run the provided Azure setup script in your local terminal. Make sure you are logged in to Azure CLI (`az login`):

```powershell
# Run the setup script to provision RG, ACR, and Container Apps Environment
bash ./scripts/setup-azure.sh
```

### 2. Verify / Update GitHub Secrets
Recreating the infrastructure might generate new credentials or access keys (especially for the ACR). Make sure your GitHub secrets are up to date under **Settings > Secrets and variables > Actions**:

Ensure these are set to the correct values printed at the end of the script:
* `AZURE_RESOURCE_GROUP` (default: `solo-leveling-rg`)
* `AZURE_CONTAINER_APP_ENVIRONMENT` (default: `solo-leveling-env`)
* `AZURE_CONTAINER_REGISTRY` (e.g., `sololevelingacr.azurecr.io`)
* `ACR_USERNAME`
* `ACR_PASSWORD`

If the Service Principal credentials were also deleted, run this to generate a new one and update the `AZURE_CREDENTIALS` secret:
```powershell
az ad sp create-for-rbac `
  --name "solo-leveling-github-actions" `
  --role contributor `
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/solo-leveling-rg `
  --sdk-auth
```

### 3. Run the GitHub Action Workflow
Once the secrets are updated, trigger the **Deploy to Azure Container Apps** workflow from GitHub Actions (as described in Scenario A). It will build the Docker containers, push them to the new registry, and deploy all three services:
1. 🟢 `solo-leveling-mongodb` (Database)
2. 🔵 `solo-leveling-fastapi` (AI Backend)
3. 🟡 `solo-leveling-nextjs` (Frontend Dashboard)

---

## 📈 Monitoring & Verifying Deployments

Once the deployment finishes, the GitHub Action will output the public URL of your application:
```text
🚀 Application deployed successfully!
🌐 Application URL: https://solo-leveling-nextjs.<your-suffix>.azurecontainerapps.io
```

You can check the status of your services directly via:
```powershell
# List all container apps and their provisioning states
az containerapp list --resource-group solo-leveling-rg -o table
```
