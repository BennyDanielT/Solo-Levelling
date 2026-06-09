# Interview Preparation: Cloud Infrastructure & CI/CD
This guide details the **Azure Container Apps** infrastructure design, containerization strategy, and **GitHub Actions** CI/CD pipeline, designed for DevOps and Cloud Engineer interview questions.

---

## 1. Cloud Infrastructure Architecture
The application runs entirely containerized on **Azure Container Apps (ACA)** inside a managed environment, allowing scale-to-zero capabilities and private networking between services.

```mermaid
graph LR
    subgraph Public_Internet ["Public Internet"]
        DNS["cloud.maxeffortgazette.com"]
    end

    subgraph Azure_ACA_Env ["Azure Container App Environment (Managed VNet)"]
        NextJS["solo-leveling-nextjs (External Ingress: 3000)"]
        FastAPI["solo-leveling-fastapi (External Ingress: 8000)"]
        MongoDB["solo-leveling-mongodb (Internal Ingress: 27017)"]
    end

    subgraph Azure_Services ["Azure Resources"]
        ACR["Azure Container Registry (ACR)"]
        Foundry["Azure AI Foundry (SaaS)"]
    end

    %% Routing
    DNS -->|HTTPS (Port 443)| NextJS
    DNS -->|HTTPS (Port 443)| FastAPI
    NextJS -->|Internal VNet Proxy| FastAPI
    FastAPI -->|Internal VNet Port 27017| MongoDB
    FastAPI -->|HTTPS Azure OpenAI API| Foundry
    NextJS -->|ACR Image Pull| ACR
    FastAPI -->|ACR Image Pull| ACR
```

### Key Components:
1. **Azure Container Apps (ACA)**: Serverless container platform built on Kubernetes (KEDA). It manages autoscaling (0 to 5 replicas based on CPU/HTTP traffic) and automates SSL certificate generation.
2. **Azure Container Registry (ACR)**: Secure private Docker registry hosting the images.
3. **Private Virtual Network Ingress**:
   * `solo-leveling-mongodb` is configured with `--ingress internal`. It is strictly blocked from the public internet. It can only be reached by other containers inside the ACA Environment virtual network.
   * `solo-leveling-nextjs` and `solo-leveling-fastapi` are configured with `--ingress external` to allow public traffic.

---

## 2. CI/CD Pipeline (GitHub Actions)
The deployment is automated using `.github/workflows/deploy-azure.yml`. It runs on every merge to `main`.

### Key Pipeline Stages:
1. **Login and Registry Authentication**:
   * Uses `azure/login@v1` with a Service Principal credential (`AZURE_CREDENTIALS` stored in GitHub secrets).
   * Logs into ACR using `azure/docker-login@v1`.
2. **Multi-Architecture Docker Build with Cache**:
   * Employs `docker/build-push-action@v5` with GitHub Actions caching (`cache-from: type=gha`, `cache-to: type=gha,mode=max`) to speed up subsequent image compilations.
   * Compiles three Dockerfiles: `Dockerfile.mongodb`, `ai-agent-service/Dockerfile`, and the Next.js production `Dockerfile`.
3. **Azure CLI Container Updates**:
   * Uses `az containerapp create` or `az containerapp update` to register the new image tags.
   * Dynamically retrieves the FastAPI backend URL (`fqdn`) using JMESPath queries and passes it to the Next.js container as `FASTAPI_SERVICE_URL`.

---

## 3. Interview Scenarios: Questions & Answers

### Q1: "What are the benefits of Azure Container Apps (ACA) compared to deploying on Azure Kubernetes Service (AKS) or VM scale sets?"
* **Answer Script**:
  > *"Azure Container Apps provides a managed serverless container runtime that abstracts away Kubernetes cluster management (like control planes, node pools, and ingress controllers). Unlike virtual machines, ACA supports scaling down to zero replicas when idle, saving cloud spend.*
  > *Unlike AKS, which requires custom ingress configurations, cert-manager setup, and complex yaml definitions, ACA comes with built-in HTTPS ingress, automatic SSL certificate provisioning, and KEDA-driven scaling out-of-the-box. This allowed us to focus entirely on application code while maintaining a production-ready containerized cluster."*

### Q2: "How did you design your database network security on the cloud?"
* **Answer Script**:
  > *"To protect user data, we implemented a zero-trust network boundary. The MongoDB container app is deployed with `--ingress internal`. This means it receives no public FQDN and is not exposed to the public internet.*
  > *Only containers running inside our Azure Container Apps Environment (on the same virtual network), like our FastAPI backend, can reach the database using its internal host resolution (`solo-leveling-mongodb.internal...`). The Next.js frontend has no direct access to MongoDB, enforcing a strict 3-tier architecture: Presentation Layer (Next.js) -> Application Logic Layer (FastAPI) -> Data Layer (MongoDB)."*

### Q3: "Next.js inlines environment variables starting with `NEXT_PUBLIC_` during build time. How did you handle this inside your Docker build pipeline?"
* **Answer Script**:
  > *"This is a common issue with Static/Client-Side hydration in Next.js. Since Docker images are built once and run in multiple environments, build-time variables break the 'build once, run anywhere' paradigm.*
  > *To resolve this, we bypassed client-side variable inlining by routing all browser requests through server-side Next.js API Routes (proxies). Instead of the browser hitting `process.env.NEXT_PUBLIC_FASTAPI_URL` directly, it calls relative paths like `/api/goals`.*
  > *The Next.js server receives this call, extracts the dynamic, runtime-injected `FASTAPI_SERVICE_URL` environment variable, and proxies the request to FastAPI. This keeps our environment configuration 100% dynamic, eliminates build-time configurations, and secures our backend endpoints."*
