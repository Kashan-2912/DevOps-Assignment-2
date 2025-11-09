# Jenkins CI/CD Assignment Checklist

## Part-II: Jenkins Automation Pipeline

### Prerequisites Completed
- [ ] Part-I docker-compose.yml is available
- [ ] Application code is ready
- [ ] AWS account is set up

---

## Task 1: AWS EC2 Setup
- [ ] Launch EC2 instance (Ubuntu Server 22.04)
- [ ] Instance type: t2.medium or larger
- [ ] Configure Security Groups:
  - [ ] Port 22 (SSH)
  - [ ] Port 80 (HTTP)
  - [ ] Port 8080 (Jenkins)
  - [ ] Port 3001 (Backend - Jenkins)
  - [ ] Port 5174 (Frontend - Jenkins)
  - [ ] Port 27018 (MongoDB - Jenkins)
- [ ] Connect to EC2 via SSH
- [ ] Update system packages

---

## Task 2: Jenkins Installation on EC2
- [ ] Install Java 17 (Jenkins requirement)
- [ ] Add Jenkins repository
- [ ] Install Jenkins
- [ ] Start Jenkins service
- [ ] Access Jenkins on port 8080
- [ ] Complete initial setup wizard
- [ ] Install suggested plugins
- [ ] Create admin user

---

## Task 3: Docker Installation on EC2
- [ ] Install Docker
- [ ] Install Docker Compose
- [ ] Start Docker service
- [ ] Add jenkins user to docker group
- [ ] Restart Jenkins
- [ ] Verify jenkins can run docker commands

---

## Task 4: GitHub Repository Setup
- [ ] Create new GitHub repository: `ezyshopper`
- [ ] Add .gitignore file
- [ ] Initialize git in local project
- [ ] Add all project files
- [ ] Commit changes
- [ ] Push code to GitHub
- [ ] Verify all files are uploaded

---

## Task 5: Configure docker-compose-jenkins.yml
- [ ] File created with volume mounts (not Dockerfiles)
- [ ] Backend configuration:
  - [ ] Uses base image: node:18-alpine
  - [ ] Volume: ./backend mounted
  - [ ] Port changed to: 3001
  - [ ] Container name: ezyshopper-backend-jenkins
  - [ ] Command: npm install && node server.js
- [ ] Frontend configuration:
  - [ ] Uses base image: node:18-alpine
  - [ ] Volume: ./frontend mounted
  - [ ] Port changed to: 5174
  - [ ] Container name: ezyshopper-frontend-jenkins
  - [ ] Command: npm install && npm run build && serve
- [ ] MongoDB configuration:
  - [ ] Uses base image: mongo:6.0
  - [ ] Volume: mongo_data_jenkins
  - [ ] Port changed to: 27018
  - [ ] Container name: ezyshopper-mongo-jenkins
- [ ] Network configured
- [ ] Environment variables set correctly

---

## Task 6: Create Jenkinsfile
- [ ] Jenkinsfile created in project root
- [ ] Pipeline stages defined:
  - [ ] **Stage 1: Checkout** - Git clone from GitHub
  - [ ] **Stage 2: Environment Setup** - Docker setup
  - [ ] **Stage 3: Build Application** - Docker Compose build
  - [ ] **Stage 4: Verify Deployment** - Check containers
  - [ ] **Stage 5: Health Check** - Test endpoints
- [ ] GitHub repository URL updated
- [ ] Post-build actions configured (success/failure)

---

## Task 7: Jenkins Plugin Installation
- [ ] Git Plugin installed
- [ ] Pipeline Plugin installed
- [ ] Docker Pipeline Plugin installed
- [ ] GitHub Integration Plugin installed
- [ ] Jenkins restarted after plugin installation

---

## Task 8: Jenkins Pipeline Configuration
- [ ] Create new Pipeline job in Jenkins
- [ ] Configure Pipeline settings:
  - [ ] Name: EzyShopper-Build-Pipeline
  - [ ] Type: Pipeline
  - [ ] Description added
  - [ ] SCM: Git selected
  - [ ] Repository URL configured
  - [ ] Branch: main
  - [ ] Script Path: Jenkinsfile
- [ ] GitHub credentials added (if private repo)
- [ ] Docker Hub credentials added (if needed)

---

## Task 9: Test Pipeline Execution
- [ ] Click "Build Now" in Jenkins
- [ ] Monitor console output
- [ ] Verify all stages complete successfully:
  - [ ] ✓ Checkout stage
  - [ ] ✓ Environment Setup stage
  - [ ] ✓ Build Application stage
  - [ ] ✓ Verify Deployment stage
  - [ ] ✓ Health Check stage
- [ ] Check for any errors in logs

---

## Task 10: Verify Deployment
- [ ] SSH into EC2 instance
- [ ] Check running containers:
  ```bash
  docker ps
  ```
- [ ] Verify container names:
  - [ ] ezyshopper-backend-jenkins
  - [ ] ezyshopper-frontend-jenkins
  - [ ] ezyshopper-mongo-jenkins
- [ ] Check container logs:
  ```bash
  docker logs ezyshopper-backend-jenkins
  docker logs ezyshopper-frontend-jenkins
  ```
- [ ] Access application URLs:
  - [ ] Frontend: http://YOUR_EC2_IP:5174
  - [ ] Backend: http://YOUR_EC2_IP:3001

---

## Task 11: Enable Continuous Integration (Optional)
- [ ] Configure GitHub webhook
- [ ] Enable "GitHub hook trigger" in Jenkins pipeline
- [ ] Test automatic build on git push
- [ ] Verify webhook delivery in GitHub

---

## Deliverables for Assignment Submission

### Code Files
- [ ] `docker-compose-jenkins.yml` - Modified compose file with volumes
- [ ] `Jenkinsfile` - Pipeline script
- [ ] `.gitignore` - Proper gitignore configuration
- [ ] All application code in GitHub repository

### Documentation
- [ ] Screenshots of:
  - [ ] EC2 instance running
  - [ ] Jenkins dashboard
  - [ ] Pipeline stages execution
  - [ ] Successful build completion
  - [ ] Running Docker containers
  - [ ] Application running in browser
- [ ] Brief report explaining:
  - [ ] Jenkins setup process
  - [ ] Pipeline stages explanation
  - [ ] Differences between Part-I and Part-II
  - [ ] Challenges faced and solutions

### GitHub Repository
- [ ] Repository URL provided
- [ ] All code committed and pushed
- [ ] README with setup instructions
- [ ] Repository is accessible

---

## Key Differences: Part-I vs Part-II

| Aspect | Part-I | Part-II (Jenkins) |
|--------|---------|-------------------|
| **Build Method** | Pre-built Docker images | Volume mounts with base images |
| **Dockerfiles** | Used for building images | Not used |
| **Backend Port** | 3000 | 3001 |
| **Frontend Port** | 5173 | 5174 |
| **MongoDB Port** | 27017 (internal) | 27018 |
| **Container Names** | backend, frontend, mongo | ezyshopper-*-jenkins |
| **Code Deployment** | Copied into image | Mounted as volume |
| **Automation** | Manual docker-compose | Jenkins pipeline |
| **CI/CD** | None | Automated via Jenkins |

---

## Common Issues and Solutions

### Issue 1: Jenkins can't run docker commands
**Solution:** 
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue 2: Port conflicts
**Solution:** Ensure different ports are used (3001, 5174, 27018)

### Issue 3: Node modules permission issues
**Solution:** Use volumes correctly in docker-compose-jenkins.yml

### Issue 4: Frontend not building
**Solution:** Check npm install and build commands in docker-compose

### Issue 5: Can't access application
**Solution:** Verify EC2 security group rules for ports 3001 and 5174

---

## Learning Outcomes Achieved

Upon completion, you will have:
- ✓ Configured and installed Jenkins on AWS EC2
- ✓ Integrated Git with Jenkins for source control
- ✓ Integrated Docker with Jenkins for containerization
- ✓ Created a containerized automation pipeline
- ✓ Implemented volume-based deployment (vs image-based)
- ✓ Automated the build phase of software development
- ✓ Understood CI/CD pipeline concepts
- ✓ Gained hands-on experience with DevOps tools

---

## Final Checks Before Submission

- [ ] All checklist items completed
- [ ] Application accessible via browser
- [ ] GitHub repository is complete and accessible
- [ ] Screenshots captured and organized
- [ ] Documentation is clear and complete
- [ ] Docker containers running with correct names
- [ ] Ports are correct (3001, 5174, 27018)
- [ ] Jenkins pipeline executes successfully
- [ ] No sensitive data (passwords, keys) in GitHub

---

## Notes for Presentation/Demo

### What to Demonstrate:
1. Show GitHub repository with code
2. Show Jenkins dashboard and pipeline
3. Trigger a manual build
4. Show pipeline stages executing
5. Show Docker containers running
6. Access the application in browser
7. Explain the Jenkinsfile stages
8. Explain docker-compose-jenkins.yml configuration

### What to Explain:
- How Jenkins fetches code from GitHub
- How the pipeline uses Docker to build the application
- Difference between using volumes vs Dockerfiles
- Benefits of CI/CD automation
- How this improves the development workflow

---

Good luck with your assignment! 🎯

