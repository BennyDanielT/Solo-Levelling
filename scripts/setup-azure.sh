#!/bin/bash

# Azure Container Apps Deployment Setup Script
# This script creates the necessary Azure resources for deploying Solo Leveling

set -e

# Configuration
RESOURCE_GROUP="solo-leveling-rg"
LOCATION="canadaeast"
CONTAINER_REGISTRY_NAME="sololevelingacr"
CONTAINER_APP_ENV="solo-leveling-env"
LOG_ANALYTICS_WORKSPACE="solo-leveling-logs"

echo "🚀 Setting up Azure Container Apps infrastructure..."

# Login to Azure (uncomment if not already logged in)
# az login

# Create Resource Group
echo "📦 Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create Azure Container Registry
echo "🐳 Creating Azure Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_REGISTRY_NAME \
  --sku Standard \
  --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show \
  --name $CONTAINER_REGISTRY_NAME \
  --query username -o tsv)

ACR_PASSWORD=$(az acr credential show \
  --name $CONTAINER_REGISTRY_NAME \
  --query "passwords[0].value" -o tsv)

ACR_LOGIN_SERVER=$(az acr show \
  --name $CONTAINER_REGISTRY_NAME \
  --query loginServer -o tsv)

# Create Log Analytics Workspace
echo "📊 Creating Log Analytics workspace..."
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_ANALYTICS_WORKSPACE \
  --location $LOCATION

LOG_ANALYTICS_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_ANALYTICS_WORKSPACE \
  --query customerId -o tsv)

LOG_ANALYTICS_KEY=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_ANALYTICS_WORKSPACE \
  --query primarySharedKey -o tsv)

# Create Container Apps Environment
echo "🌐 Creating Container Apps environment..."
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --logs-workspace-id $LOG_ANALYTICS_ID \
  --logs-workspace-key $LOG_ANALYTICS_KEY

# Display credentials
echo ""
echo "✅ Azure infrastructure created successfully!"
echo ""
echo "📝 GitHub Secrets Configuration:"
echo "================================"
echo "Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):"
echo ""
echo "AZURE_RESOURCE_GROUP: $RESOURCE_GROUP"
echo "AZURE_CONTAINER_APP_ENVIRONMENT: $CONTAINER_APP_ENV"
echo "AZURE_CONTAINER_REGISTRY: $ACR_LOGIN_SERVER"
echo "ACR_USERNAME: $ACR_USERNAME"
echo "ACR_PASSWORD: $ACR_PASSWORD"
echo ""
echo "AZURE_CREDENTIALS: (Run the command below to generate)"
echo "---"
echo "az ad sp create-for-rbac \\"
echo "  --name \"solo-leveling-github-actions\" \\"
echo "  --role contributor \\"
echo "  --scopes /subscriptions/\$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP \\"
echo "  --sdk-auth"
echo "---"
echo ""
echo "⚠️  Also add these application secrets:"
echo "  - MONGO_ROOT_USERNAME"
echo "  - MONGO_ROOT_PASSWORD"
echo "  - MONGODB_URL"
echo "  - NEXTAUTH_SECRET"
echo "  - NEXTAUTH_URL"
echo "  - GOOGLE_CLIENT_ID"
echo "  - GOOGLE_CLIENT_SECRET"
echo "  - NEWS_API_KEY"
echo ""
echo "🎉 Setup complete!"
