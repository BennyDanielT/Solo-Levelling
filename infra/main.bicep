@description('The location where resources will be deployed.')
param location string = resourceGroup().location

@description('The location where the Elasticsearch monitor will be deployed. Must be a supported region.')
param elasticLocation string = 'canadacentral'

@description('The name of the Azure Container Apps Environment.')
param containerAppEnvName string = 'solo-leveling-env'

@description('The name of the Log Analytics Workspace.')
param logAnalyticsWorkspaceName string = 'solo-leveling-logs'

@description('The name of the Azure Key Vault for secrets management.')
param keyVaultName string = 'sololevelingkv-${uniqueString(resourceGroup().id)}'

@description('The name of the managed Elasticsearch resource.')
param elasticMonitorName string = 'solo-leveling-elastic-monitor'

@description('The email address associated with the Elastic owner/administrator.')
param adminEmail string = 'benny28dany@gmail.com'

// 1. Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// 2. Container Apps Environment
resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

// 3. Azure Native Elastic Integration (Managed Elasticsearch & Kibana)
resource elasticMonitor 'Microsoft.Elastic/monitors@2024-03-01' = {
  name: elasticMonitorName
  location: elasticLocation
  sku: {
    name: 'ess-monthly-consumption_Monthly' // Native consumption tier
  }
  properties: {
    userInfo: {
      emailAddress: adminEmail
    }
  }
}

// 4. Elastic Diagnostic Setting Tag Rules (Log Forwarding Rules)
resource elasticTagRules 'Microsoft.Elastic/monitors/tagRules@2024-03-01' = {
  name: 'default'
  parent: elasticMonitor
  properties: {
    logRules: {
      sendActivityLogs: true
      sendAadLogs: false
      sendSubscriptionLogs: true
      filteringTags: [
        {
          name: 'environment'
          value: 'production'
          action: 'Include'
        }
      ]
    }
  }
}

// 5. Secure Key Vault for Secrets Management
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    tenantId: subscription().tenantId
    accessPolicies: []
    sku: {
      name: 'standard'
      family: 'A'
    }
  }
}

// Output critical connection endpoints
output elasticsearchEndpoint string = elasticMonitor.properties.elasticProperties.elasticCloudDeployment.elasticsearchServiceUrl
output kibanaEndpoint string = elasticMonitor.properties.elasticProperties.elasticCloudDeployment.kibanaServiceUrl
output keyVaultUri string = keyVault.properties.vaultUri
