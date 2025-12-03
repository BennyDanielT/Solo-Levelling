# Docker Setup Guide

## 🚀 Services Overview

The Solo Levelling application runs 4 Docker services:

1. **MongoDB** (Port 27017) - Database
2. **Mongo Express** (Port 8081) - Database UI
3. **FastAPI** (Port 8000) - Backend API
4. **Next.js App** (Port 3000) - Frontend

## 📋 Prerequisites

- Docker & Docker Compose installed
- `.env` file configured with required variables

## 🔧 Environment Variables

Ensure your `.env` file contains:

```bash
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=solo-leveling-2024
MONGO_DATABASE=solo-leveling-db
MONGO_PORT=27017
MONGO_EXPRESS_PORT=8081

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend (Email)
RESEND_API_KEY=your-resend-api-key

# Azure AI (Optional)
AZURE_AI_PROJECT_ENDPOINT=
AZURE_EXISTING_AGENT_ID=
```

## 🎯 Quick Start

### Using the Management Script (Recommended)

```bash
# Start all services
./docker-manage.sh start

# View status
./docker-manage.sh status

# View logs
./docker-manage.sh logs

# Stop all services
./docker-manage.sh stop
```

### Using Docker Compose Directly

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild services
docker compose up -d --build
```

## 📊 Service Details

### MongoDB
- **Container**: `solo-leveling-mongodb`
- **Port**: 27017
- **Connection String**: `mongodb://admin:solo-leveling-2024@localhost:27017/solo_levelling?authSource=admin`
- **Health Check**: Automatic ping every 5 seconds

### Mongo Express (Database UI)
- **Container**: `solo-leveling-mongo-ui`
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: solo-leveling-2024

### FastAPI Backend
- **Container**: `solo-leveling-fastapi`
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Hot Reload**: Enabled (mounted volume)

### Next.js Frontend
- **Container**: `solo-leveling-app`
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled (mounted volume)
- **Development Mode**: Active

## 🔍 Useful Commands

### View Service Status
```bash
docker compose ps
```

### View Specific Service Logs
```bash
docker compose logs -f fastapi
docker compose logs -f app
docker compose logs -f mongodb
```

### Restart Specific Service
```bash
docker compose restart fastapi
docker compose restart app
```

### Access MongoDB Shell
```bash
./docker-manage.sh mongo-shell
# or
docker compose exec mongodb mongosh -u admin -p solo-leveling-2024 --authenticationDatabase admin
```

### Rebuild Single Service
```bash
docker compose up -d --build fastapi
docker compose up -d --build app
```

## 💾 Database Management

### Backup Database
```bash
./docker-manage.sh backup
```
Creates a timestamped backup in `./backups/` directory.

### Restore Database
```bash
./docker-manage.sh restore ./backups/mongodb_backup_20231203_120000.gz
```

### Manual Backup
```bash
docker compose exec mongodb mongodump \
  --username admin \
  --password solo-leveling-2024 \
  --authenticationDatabase admin \
  --out /backup
```

## 🧹 Cleanup

### Remove Containers Only
```bash
docker compose down
```

### Remove Containers and Volumes
```bash
docker compose down -v
```

### Complete Cleanup (Includes Images)
```bash
./docker-manage.sh cleanup
# or
docker compose down -v --rmi all
```

## 🐛 Troubleshooting

### Service Won't Start
1. Check if ports are already in use:
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :8000
   sudo lsof -i :27017
   ```

2. View service logs:
   ```bash
   docker compose logs [service-name]
   ```

3. Rebuild the service:
   ```bash
   docker compose up -d --build [service-name]
   ```

### Database Connection Issues
1. Verify MongoDB is healthy:
   ```bash
   docker compose ps mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker compose logs mongodb
   ```

3. Test connection:
   ```bash
   docker compose exec mongodb mongosh -u admin -p solo-leveling-2024
   ```

### Hot Reload Not Working
1. Ensure volumes are mounted correctly in docker-compose.yml
2. Restart the service:
   ```bash
   docker compose restart app
   ```

### Permission Issues
If you encounter permission issues with volumes:
```bash
sudo chown -R $USER:$USER .
```

## 🔄 Service Dependencies

The services start in this order:
1. **MongoDB** - Waits for health check
2. **Mongo Express** - Waits for MongoDB to be healthy
3. **FastAPI** - Waits for MongoDB to be healthy
4. **Next.js App** - Waits for FastAPI to start and MongoDB to be healthy

## 📈 Monitoring

### View Resource Usage
```bash
docker stats
```

### Check Container Health
```bash
docker compose ps
```

### Inspect Service Configuration
```bash
docker compose config
```

## 🔐 Security Notes

- MongoDB credentials are stored in `.env` file (not committed to git)
- FastAPI uses authentication via NextAuth JWT tokens
- Database connection uses `authSource=admin` for proper authentication
- All services run on isolated Docker network

## 🚦 Production Considerations

For production deployment:

1. Use production-grade MongoDB (Atlas, managed service)
2. Set `NODE_ENV=production`
3. Remove volume mounts (no hot reload)
4. Use proper SSL/TLS certificates
5. Implement proper backup strategy
6. Set resource limits in docker-compose.yml
7. Use secrets management (Docker secrets, Vault, etc.)
8. Enable Docker logs rotation

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Docker Deployment](https://fastapi.tiangolo.com/deployment/docker/)
