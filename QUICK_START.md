# Quick Start Guide - Jenkins CI/CD Pipeline

This is a condensed version for quick reference. For detailed instructions, see `JENKINS_SETUP_GUIDE.md`.

## Step 1: Setup EC2 (15 minutes)

```bash
# Launch Ubuntu 22.04 t2.medium instance
# Open ports: 22, 80, 8080, 3001, 5174, 27018

# Connect and update
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install Jenkins (10 minutes)

```bash
# Install Java
sudo apt install fontconfig openjdk-17-jre -y

# Install Jenkins
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins -y
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Access Jenkins at http://YOUR_EC2_IP:8080
```

## Step 3: Install Docker (5 minutes)

```bash
# Install Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose -y

# Add Jenkins to Docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## Step 4: Setup GitHub (5 minutes)

```powershell
# On your local machine
cd C:\Users\mkash\OneDrive\Desktop\ezyshopper

# Initialize and push
git init
git add .
git commit -m "Initial commit for Jenkins CI/CD"
git remote add origin https://github.com/YOUR_USERNAME/ezyshopper.git
git branch -M main
git push -u origin main
```

## Step 5: Configure Jenkins (10 minutes)

1. **Access Jenkins:** http://YOUR_EC2_IP:8080
2. **Install Plugins:**
   - Manage Jenkins → Plugins
   - Install: Docker Pipeline, GitHub Integration
   - Restart Jenkins

3. **Create Pipeline:**
   - New Item → "EzyShopper-Build-Pipeline" → Pipeline
   - Pipeline → Definition: Pipeline script from SCM
   - SCM: Git
   - Repository: https://github.com/YOUR_USERNAME/ezyshopper.git
   - Branch: */main
   - Script Path: Jenkinsfile
   - Save

## Step 6: Update Configuration Files

**Update Jenkinsfile:**
```groovy
// Line 9: Replace with your GitHub URL
GIT_REPO = 'https://github.com/YOUR_USERNAME/ezyshopper.git'
```

**Update docker-compose-jenkins.yml:**
```yaml
# Line 17: Replace with your EC2 IP
- CLIENT_URL=http://YOUR_EC2_IP:5174/
```

## Step 7: Run Pipeline (2 minutes)

1. Go to your pipeline in Jenkins
2. Click "Build Now"
3. Monitor console output
4. Wait for all stages to complete

## Step 8: Verify (2 minutes)

```bash
# SSH to EC2
docker ps

# Should see 3 containers:
# - ezyshopper-backend-jenkins
# - ezyshopper-frontend-jenkins
# - ezyshopper-mongo-jenkins
```

**Access Application:**
- Frontend: http://YOUR_EC2_IP:5174
- Backend: http://YOUR_EC2_IP:3001

---

## Pipeline Stages

1. **Checkout** → Fetches code from GitHub
2. **Environment Setup** → Prepares Docker environment
3. **Build Application** → Runs docker-compose with volumes
4. **Verify Deployment** → Checks containers are running
5. **Health Check** → Tests application endpoints

---

## Key Changes from Part-I

| Feature | Part-I | Part-II |
|---------|--------|---------|
| Images | Pre-built | Base images + volumes |
| Build | Dockerfile | No Dockerfile |
| Ports | 3000, 5173 | 3001, 5174 |
| Names | backend, frontend | ezyshopper-*-jenkins |
| Automation | Manual | Jenkins Pipeline |

---

## Troubleshooting

**Jenkins can't run docker:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Port conflicts:**
```bash
docker-compose -f docker-compose-jenkins.yml down
docker system prune -f
```

**Can't access application:**
- Check EC2 Security Groups
- Ensure ports 3001, 5174 are open
- Use Public IP, not Private IP

---

## Useful Commands

```bash
# Jenkins
sudo systemctl status jenkins
sudo journalctl -u jenkins -f

# Docker
docker ps
docker logs ezyshopper-backend-jenkins
docker-compose -f docker-compose-jenkins.yml logs -f

# Cleanup
docker-compose -f docker-compose-jenkins.yml down
docker system prune -f
```

---

## Files Created for This Assignment

1. **docker-compose-jenkins.yml** - Modified compose with volumes
2. **Jenkinsfile** - Pipeline script
3. **JENKINS_SETUP_GUIDE.md** - Detailed setup instructions
4. **ASSIGNMENT_CHECKLIST.md** - Complete checklist
5. **QUICK_START.md** - This file
6. **.gitignore** - Git ignore configuration

---

## Total Time: ~50 minutes

✓ EC2 Setup: 15 min  
✓ Jenkins Install: 10 min  
✓ Docker Install: 5 min  
✓ GitHub Setup: 5 min  
✓ Jenkins Config: 10 min  
✓ Testing: 5 min  

---

**Need help?** Check `JENKINS_SETUP_GUIDE.md` for detailed explanations! 🚀

