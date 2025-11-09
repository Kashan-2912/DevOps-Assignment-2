# Jenkins CI/CD Pipeline Setup Guide for EzyShopper

This guide will walk you through setting up Jenkins on AWS EC2 to automate the build phase of your web application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS EC2 Setup](#aws-ec2-setup)
3. [Jenkins Installation](#jenkins-installation)
4. [Docker Installation](#docker-installation)
5. [GitHub Repository Setup](#github-repository-setup)
6. [Jenkins Configuration](#jenkins-configuration)
7. [Pipeline Creation](#pipeline-creation)
8. [Testing the Pipeline](#testing-the-pipeline)

---

## Prerequisites

- AWS Account
- GitHub Account
- Basic knowledge of Linux commands
- SSH key pair for EC2 access

---

## AWS EC2 Setup

### Step 1: Launch EC2 Instance

1. **Log in to AWS Console** → Navigate to EC2 Dashboard
2. **Click "Launch Instance"**
3. **Configure Instance:**
   - **Name:** Jenkins-Server
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type:** t2.medium (minimum for Jenkins)
   - **Key Pair:** Create or select existing key pair
   - **Network Settings:**
     - Allow SSH (Port 22) from your IP
     - Allow HTTP (Port 80)
     - Allow Custom TCP (Port 8080) - Jenkins
     - Allow Custom TCP (Port 3001) - Backend
     - Allow Custom TCP (Port 5174) - Frontend
   - **Storage:** 30 GB gp3

4. **Launch Instance**

### Step 2: Connect to EC2 Instance

```bash
# Windows (PowerShell)
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# After connecting, update system
sudo apt update && sudo apt upgrade -y
```

---

## Jenkins Installation

### Step 1: Install Java (Jenkins Requirement)

```bash
# Install Java 17
sudo apt install fontconfig openjdk-17-jre -y

# Verify installation
java -version
```

### Step 2: Install Jenkins

```bash
# Add Jenkins repository key
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Add Jenkins apt repository
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list
sudo apt update

# Install Jenkins
sudo apt install jenkins -y

# Start Jenkins service
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

### Step 3: Initial Jenkins Setup

1. **Get Initial Admin Password:**
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

2. **Access Jenkins:**
   - Open browser: `http://YOUR_EC2_PUBLIC_IP:8080`
   - Enter the initial admin password
   - Click "Install suggested plugins"
   - Create admin user account
   - Save Jenkins URL

---

## Docker Installation

### Step 1: Install Docker

```bash
# Update packages
sudo apt update

# Install prerequisites
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
```

### Step 2: Install Docker Compose

```bash
# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker-compose --version
```

### Step 3: Add Jenkins User to Docker Group

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins to apply changes
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

---

## GitHub Repository Setup

### Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository: `ezyshopper`
2. Make it public or private (your choice)
3. **Do NOT initialize with README** (we'll push existing code)

### Step 2: Push Your Code to GitHub

```powershell
# On your local machine (Windows PowerShell)
# Navigate to your project directory
cd C:\Users\mkash\OneDrive\Desktop\ezyshopper

# Initialize git (if not already initialized)
git init

# Create .gitignore file
# (See .gitignore content below)

# Add all files
git add .

# Commit
git commit -m "Initial commit for Jenkins CI/CD"

# Add remote repository
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ezyshopper.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Create .gitignore

Create a `.gitignore` file in your project root:

```
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Build outputs
frontend/dist/
backend/dist/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
tmp/
temp/
```

---

## Jenkins Configuration

### Step 1: Install Required Plugins

1. **Go to Jenkins Dashboard** → Manage Jenkins → Plugins
2. **Install the following plugins:**
   - Git Plugin (usually pre-installed)
   - Pipeline Plugin (usually pre-installed)
   - Docker Pipeline Plugin
   - GitHub Integration Plugin

3. **Restart Jenkins after installation:**
```bash
sudo systemctl restart jenkins
```

### Step 2: Configure Git in Jenkins

1. **Manage Jenkins** → **Tools**
2. **Git installations:**
   - Name: `Default`
   - Path: `/usr/bin/git`

### Step 3: Add GitHub Credentials (Optional for Private Repos)

1. **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. **Add Credentials:**
   - Kind: Username with password
   - Username: Your GitHub username
   - Password: GitHub Personal Access Token
   - ID: `github-credentials`

**To create GitHub Personal Access Token:**
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` scope

### Step 4: Configure Docker Hub Credentials (Optional)

1. **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. **Add Credentials:**
   - Kind: Username with password
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password
   - ID: `dockerhub-credentials`

---

## Pipeline Creation

### Step 1: Update Jenkinsfile

1. Edit the `Jenkinsfile` in your project
2. Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username
3. Update `GIT_REPO` URL if needed

### Step 2: Update docker-compose-jenkins.yml

1. Edit `docker-compose-jenkins.yml`
2. Replace `YOUR_EC2_IP` with your actual EC2 public IP address in the `CLIENT_URL` environment variable

### Step 3: Create Jenkins Pipeline

1. **Jenkins Dashboard** → **New Item**
2. **Enter item name:** `EzyShopper-Build-Pipeline`
3. **Select:** Pipeline
4. **Click OK**

5. **Configure Pipeline:**
   - **Description:** "Automated build pipeline for EzyShopper web application"
   
   - **Build Triggers:** (Optional)
     - ☑ GitHub hook trigger for GITScm polling
   
   - **Pipeline:**
     - **Definition:** Pipeline script from SCM
     - **SCM:** Git
     - **Repository URL:** `https://github.com/YOUR_GITHUB_USERNAME/ezyshopper.git`
     - **Credentials:** Select your GitHub credentials (if private repo)
     - **Branch:** `*/main`
     - **Script Path:** `Jenkinsfile`

6. **Save**

---

## Testing the Pipeline

### Step 1: Run the Pipeline

1. **Go to your pipeline:** EzyShopper-Build-Pipeline
2. **Click "Build Now"**
3. **Monitor the build progress** in the console output

### Step 2: Verify Pipeline Stages

The pipeline should execute these stages:
1. ✓ Checkout - Fetches code from GitHub
2. ✓ Environment Setup - Prepares Docker environment
3. ✓ Build Application - Builds containers using docker-compose
4. ✓ Verify Deployment - Checks container status
5. ✓ Health Check - Verifies application is running

### Step 3: Access Your Application

- **Frontend:** `http://YOUR_EC2_PUBLIC_IP:5174`
- **Backend:** `http://YOUR_EC2_PUBLIC_IP:3001`

### Step 4: Check Docker Containers

SSH into your EC2 instance and verify:

```bash
# Check running containers
docker ps

# Check logs
docker logs ezyshopper-backend-jenkins
docker logs ezyshopper-frontend-jenkins
docker logs ezyshopper-mongo-jenkins
```

---

## Continuous Integration Setup (Optional)

### Enable Automatic Builds on Git Push

1. **In your GitHub repository:**
   - Settings → Webhooks → Add webhook
   - Payload URL: `http://YOUR_EC2_IP:8080/github-webhook/`
   - Content type: application/json
   - Events: Just the push event
   - Active: ☑

2. **In Jenkins Pipeline Configuration:**
   - Enable "GitHub hook trigger for GITScm polling"

Now, every time you push code to GitHub, Jenkins will automatically trigger a build!

---

## Troubleshooting

### Issue 1: Jenkins can't access Docker

**Solution:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue 2: Port already in use

**Solution:**
```bash
# Stop existing containers
docker-compose -f docker-compose-jenkins.yml down

# Remove all containers
docker rm -f $(docker ps -aq)
```

### Issue 3: Jenkins build fails on npm install

**Solution:** Increase EC2 instance memory (use t2.medium instead of t2.micro)

### Issue 4: Can't access application from browser

**Solution:** Check EC2 Security Group rules:
- Ensure ports 3001 and 5174 are open
- Ensure you're using the public IP, not private IP

---

## Key Differences from Part-I

### Part-I (Original):
- Used pre-built Docker images from Docker Hub
- Built images using Dockerfiles
- Ports: 3000 (backend), 5173 (frontend)
- Container names: backend, frontend, mongo

### Part-II (Jenkins):
- Uses base images (node:18-alpine)
- Mounts code as volumes (no Dockerfile builds)
- Ports: 3001 (backend), 5174 (frontend), 27018 (mongo)
- Container names: ezyshopper-backend-jenkins, ezyshopper-frontend-jenkins, ezyshopper-mongo-jenkins
- Automated build process through Jenkins pipeline

---

## Pipeline Architecture

```
GitHub Repository
      ↓
   [Git Push]
      ↓
Jenkins Server (AWS EC2)
      ↓
   [Pipeline Stages]
      ↓
1. Checkout Code
2. Setup Environment
3. Build with Docker Compose
4. Verify Deployment
5. Health Check
      ↓
Running Application (Containerized)
```

---

## Additional Commands

### Useful Jenkins Commands

```bash
# Check Jenkins status
sudo systemctl status jenkins

# Start Jenkins
sudo systemctl start jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f
```

### Useful Docker Commands

```bash
# View all containers
docker ps -a

# View logs
docker logs <container-name>

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# View Docker Compose logs
docker-compose -f docker-compose-jenkins.yml logs -f

# Restart specific service
docker-compose -f docker-compose-jenkins.yml restart backend-jenkins
```

---

## Security Best Practices

1. **Never commit sensitive data to GitHub:**
   - Move environment variables to Jenkins credentials
   - Use `.env` files (add to .gitignore)

2. **Secure your EC2 instance:**
   - Restrict SSH access to your IP only
   - Use security groups effectively
   - Keep system updated

3. **Secure Jenkins:**
   - Enable authentication
   - Use strong passwords
   - Install security plugins
   - Regular backups

---

## Conclusion

You now have a fully functional Jenkins CI/CD pipeline that:
- ✓ Fetches code from GitHub
- ✓ Builds application in containerized environment
- ✓ Uses Docker volumes instead of building images
- ✓ Runs on different ports with unique container names
- ✓ Performs automated health checks
- ✓ Can be triggered automatically on code push

**Next Steps:**
- Add automated testing stages
- Implement deployment to production
- Add monitoring and logging
- Set up notifications (email/Slack)

---

## Support

If you encounter any issues:
1. Check Jenkins console output
2. Review Docker container logs
3. Verify EC2 security group settings
4. Ensure all services are running

Good luck with your assignment! 🚀

