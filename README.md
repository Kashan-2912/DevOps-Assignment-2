 # EzyShopper - E-Commerce Web Application

A modern full-stack e-commerce application with automated CI/CD pipeline using Jenkins.

## 🚀 Project Overview

EzyShopper is a complete e-commerce platform featuring:
- Product catalog with categories
- Shopping cart functionality
- User authentication and authorization
- Payment processing with Stripe
- Admin dashboard with analytics
- Coupon/discount system

## 📋 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand (State Management)
- Axios
- React Router
- Framer Motion

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Redis (Upstash)
- JWT Authentication
- Stripe Payment Integration
- Cloudinary (Image Storage)

### DevOps
- Docker & Docker Compose
- Jenkins CI/CD Pipeline
- AWS EC2
- Git & GitHub

## 📁 Project Structure

```
ezyshopper/
├── backend/                    # Backend API
│   ├── controllers/           # Request handlers
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── lib/                   # Utility functions
│   └── server.js              # Entry point
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── stores/            # Zustand stores
│   │   └── lib/               # Utilities
│   └── dist/                  # Build output
├── docker-compose.yml         # Part-I: Pre-built images
├── docker-compose-jenkins.yml # Part-II: Volume-based deployment
├── Jenkinsfile                # CI/CD pipeline script
└── docs/                      # Documentation
```

## 🔧 Setup Methods

### Method 1: Part-I Setup (Docker Images)

Uses pre-built Docker images from Docker Hub.

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/ezyshopper.git
cd ezyshopper

# Start services
docker-compose up -d

# Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

**Configuration:**
- Uses Dockerfiles to build images
- Ports: 3000 (backend), 5173 (frontend)
- Container names: backend, frontend, mongo

### Method 2: Part-II Setup (Jenkins CI/CD)

Automated build pipeline with volume-based deployment.

**Prerequisites:**
- AWS EC2 instance (t2.medium)
- Jenkins installed
- Docker installed
- GitHub repository

**Quick Setup:**

1. **Launch EC2 and Install Jenkins & Docker**
   ```bash
   # See QUICK_START.md for installation commands
   ```

2. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ezyshopper.git
   git push -u origin main
   ```

3. **Configure Jenkins Pipeline**
   - Create new Pipeline job
   - Point to your GitHub repository
   - Use Jenkinsfile for pipeline script

4. **Run Build**
   - Click "Build Now" in Jenkins
   - Monitor pipeline stages
   - Access application at http://YOUR_EC2_IP:5174

**Configuration:**
- Uses volume mounts (no Dockerfile builds)
- Ports: 3001 (backend), 5174 (frontend), 27018 (mongo)
- Container names: ezyshopper-*-jenkins
- Automated via Jenkins pipeline

## 📚 Documentation

### For Students/Developers
- **[QUICK_START.md](QUICK_START.md)** - Fast setup guide (50 minutes)
- **[JENKINS_SETUP_GUIDE.md](JENKINS_SETUP_GUIDE.md)** - Detailed Jenkins setup
- **[ASSIGNMENT_CHECKLIST.md](ASSIGNMENT_CHECKLIST.md)** - Complete assignment checklist

### Configuration Files
- `docker-compose.yml` - Part-I configuration (pre-built images)
- `docker-compose-jenkins.yml` - Part-II configuration (volumes)
- `Jenkinsfile` - CI/CD pipeline definition

## 🔄 Jenkins Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
└────────────────────────┬────────────────────────────────────┘
                         │ Git Push
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Jenkins Server (AWS EC2)                    │
├─────────────────────────────────────────────────────────────┤
│  Stage 1: Checkout                                           │
│  └─> Clone code from GitHub                                 │
│                                                              │
│  Stage 2: Environment Setup                                  │
│  └─> Prepare Docker environment                             │
│                                                              │
│  Stage 3: Build Application                                  │
│  └─> Run docker-compose with volumes                        │
│                                                              │
│  Stage 4: Verify Deployment                                  │
│  └─> Check containers are running                           │
│                                                              │
│  Stage 5: Health Check                                       │
│  └─> Test application endpoints                             │
└────────────────────────┬────────────────────────────────────┘
                         │ Success
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Running Application (Containerized)               │
│  Frontend: http://YOUR_EC2_IP:5174                          │
│  Backend:  http://YOUR_EC2_IP:3001                          │
└─────────────────────────────────────────────────────────────┘
```

## 🆚 Part-I vs Part-II Comparison

| Feature | Part-I | Part-II (Jenkins) |
|---------|--------|-------------------|
| **Deployment Method** | Manual docker-compose | Automated Jenkins pipeline |
| **Code Inclusion** | Built into Docker images | Mounted as volumes |
| **Dockerfiles** | Required | Not used |
| **Backend Port** | 3000 | 3001 |
| **Frontend Port** | 5173 | 5174 |
| **MongoDB Port** | 27017 (internal) | 27018 |
| **Container Names** | backend, frontend, mongo | ezyshopper-*-jenkins |
| **Build Trigger** | Manual | Automated (can use webhooks) |
| **CI/CD** | No | Yes |
| **Scalability** | Manual updates | Automated deployment |

## 🔐 Environment Variables

**Backend Environment Variables:**

```env
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
UPSTASH_REDIS_URL=your_redis_url
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_key
CLIENT_URL=http://YOUR_EC2_IP:5174/
```

> ⚠️ **Security Note:** Never commit sensitive credentials to GitHub. Use environment variables or Jenkins credentials store.

## 🛠️ Development

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Testing the Application

1. **Backend API:** `http://localhost:3000/api`
2. **Frontend:** `http://localhost:5173`
3. **Admin Access:** Use admin credentials
4. **Test Payment:** Use Stripe test cards

## 🐳 Docker Commands

```bash
# Part-I (Pre-built images)
docker-compose up -d                    # Start services
docker-compose down                     # Stop services
docker-compose logs -f                  # View logs

# Part-II (Jenkins volumes)
docker-compose -f docker-compose-jenkins.yml up -d
docker-compose -f docker-compose-jenkins.yml down
docker-compose -f docker-compose-jenkins.yml logs -f

# General Docker commands
docker ps                               # List running containers
docker logs <container-name>            # View specific container logs
docker exec -it <container-name> sh     # Access container shell
docker system prune -f                  # Clean up
```

## 📊 Jenkins Pipeline Features

✅ **Automated Checkout** - Fetches latest code from GitHub  
✅ **Environment Setup** - Prepares Docker environment  
✅ **Containerized Build** - Uses Docker Compose with volumes  
✅ **Deployment Verification** - Checks container status  
✅ **Health Checks** - Validates application endpoints  
✅ **Post-Build Actions** - Success/failure notifications  
✅ **Error Handling** - Automatic cleanup on failure  

## 🚦 Getting Started (Choose Your Path)

### For Quick Demo (Part-I):
```bash
git clone https://github.com/YOUR_USERNAME/ezyshopper.git
cd ezyshopper
docker-compose up -d
```
**Time: 5 minutes**

### For Learning CI/CD (Part-II):
1. Read `QUICK_START.md` (50 minutes total)
2. Setup AWS EC2 with Jenkins
3. Configure pipeline
4. Run automated build

**Time: ~50 minutes**

### For Assignment Submission:
1. Follow `ASSIGNMENT_CHECKLIST.md`
2. Complete all checklist items
3. Take screenshots of each stage
4. Prepare documentation

**Time: 2-3 hours**

## 📸 Screenshots & Deliverables

For assignment submission, capture:
- ✓ EC2 instance dashboard
- ✓ Jenkins dashboard
- ✓ Pipeline execution stages
- ✓ Docker containers running
- ✓ Application in browser
- ✓ GitHub repository

## 🐛 Troubleshooting

### Common Issues

**1. Jenkins can't access Docker**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**2. Port already in use**
```bash
docker-compose -f docker-compose-jenkins.yml down
netstat -tulpn | grep <port>
```

**3. Application not accessible**
- Check EC2 Security Groups
- Verify ports are open (3001, 5174)
- Use Public IP, not Private IP

**4. Build fails in Jenkins**
- Check console output
- Verify GitHub repository URL
- Ensure Docker is running
- Check container logs

## 📝 Learning Outcomes

After completing this project, you will understand:
- ✓ Containerization with Docker
- ✓ Multi-container orchestration with Docker Compose
- ✓ Continuous Integration/Continuous Deployment (CI/CD)
- ✓ Jenkins pipeline automation
- ✓ Cloud deployment on AWS EC2
- ✓ Git version control and GitHub integration
- ✓ Volume-based vs image-based deployment
- ✓ Full-stack application architecture

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed for educational purposes.

## 👨‍💻 Author

**Kashan Ashraf**
- Docker Hub: [kashan2912](https://hub.docker.com/u/kashan2912)
- GitHub: [YOUR_GITHUB_USERNAME]

## 🙏 Acknowledgments

- Jenkins Documentation
- Docker Documentation
- AWS EC2 Documentation
- MongoDB Documentation
- React & Vite Documentation

## 📞 Support

For issues and questions:
1. Check `JENKINS_SETUP_GUIDE.md` for detailed explanations
2. Review `ASSIGNMENT_CHECKLIST.md` for step-by-step guidance
3. Check Docker container logs
4. Review Jenkins console output
5. Verify EC2 security group settings

---

## 🎯 Quick Links

- [Quick Start Guide](QUICK_START.md) - Get started in 50 minutes
- [Jenkins Setup Guide](JENKINS_SETUP_GUIDE.md) - Detailed setup instructions
- [Assignment Checklist](ASSIGNMENT_CHECKLIST.md) - Complete checklist
- [Part-I Config](docker-compose.yml) - Pre-built images setup
- [Part-II Config](docker-compose-jenkins.yml) - Volume-based setup
- [Pipeline Script](Jenkinsfile) - CI/CD pipeline definition

---

**Ready to begin?** Start with [QUICK_START.md](QUICK_START.md) for fastest setup! 🚀

---

*Last Updated: November 2025*

