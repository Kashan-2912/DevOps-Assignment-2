
pipeline {
    agent any
    
    environment {
        // Define your Docker Hub credentials ID (configured in Jenkins)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        
        // Git repository URL
        GIT_REPO = 'https://github.com/Kashan-2912/DevOps-Assignment-2.git'
        GIT_BRANCH = 'main'
        
        // Application name
        APP_NAME = 'ezyshopper'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "========== Stage 1: Checking out code from GitHub =========="
                }
                // Clone the repository from GitHub
                git branch: "${GIT_BRANCH}",
                    url: "${GIT_REPO}"
                
                echo "Code checkout completed successfully!"
            }
        }

        stage('Create .env') {
      steps {
        // map each secret credential id to an environment variable inside withCredentials
        withCredentials([
          string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
          string(credentialsId: 'UPSTASH_REDIS_URL', variable: 'UPSTASH_REDIS_URL'),
          string(credentialsId: 'ACCESS_TOKEN_SECRET', variable: 'ACCESS_TOKEN_SECRET'),
          string(credentialsId: 'REFRESH_TOKEN_SECRET', variable: 'REFRESH_TOKEN_SECRET'),
          string(credentialsId: 'CLOUDINARY_CLOUD_NAME', variable: 'CLOUDINARY_CLOUD_NAME'),
          string(credentialsId: 'CLOUDINARY_API_KEY', variable: 'CLOUDINARY_API_KEY'),
          string(credentialsId: 'CLOUDINARY_API_SECRET', variable: 'CLOUDINARY_API_SECRET'),
          string(credentialsId: 'STRIPE_SECRET_KEY', variable: 'STRIPE_SECRET_KEY'),
          string(credentialsId: 'CLIENT_URL', variable: 'CLIENT_URL')
        ]) {
          // create .env file in workspace with safe permissions
          sh '''
            cat > .env <<EOF
MONGO_URI=${MONGO_URI}
UPSTASH_REDIS_URL=${UPSTASH_REDIS_URL}
ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
CLIENT_URL=${CLIENT_URL}
EOF
            # ensure .env is not readable by other users (optional)
            chmod 600 .env
            echo ".env created"
          '''
        }
      }
    }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo "========== Stage 2: Setting up environment =========="
                }
                
                // Display Docker version
                sh 'docker --version'
                sh 'docker-compose --version'
                
                // Clean up any existing containers with the same name
                sh '''
                    docker-compose -f docker-compose-jenkins.yml down || true
                    docker system prune -f
                '''
                
                echo "Environment setup completed!"
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    echo "========== Stage 3: Building application with Docker Compose =========="
                }
                
                // Build and start containers using docker-compose
                sh '''
                    docker-compose -f docker-compose-jenkins.yml up -d --build
                '''
                
                echo "Docker containers started successfully!"
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    echo "========== Stage 4: Verifying deployment =========="
                }
                
                // Wait for containers to be fully up
                sh 'sleep 30'
                
                // Check running containers
                sh 'docker-compose -f docker-compose-jenkins.yml ps'
                
                // Check container logs
                sh '''
                    echo "=== Backend Logs ==="
                    docker logs ezyshopper-backend-jenkins --tail 50
                    
                    echo "=== Frontend Logs ==="
                    docker logs ezyshopper-frontend-jenkins --tail 50
                '''
                
                echo "Deployment verification completed!"
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "========== Stage 5: Performing health checks =========="
                }
                
                // Check if backend is responding
                sh '''
                    echo "Checking backend health..."
                    curl -f http://localhost:3001/ || exit 1
                '''
                
                // Check if frontend is responding
                sh '''
                    echo "Checking frontend health..."
                    curl -f http://localhost:5174/ || exit 1
                '''
                
                echo "Health checks passed!"
            }
        }
    }
    
    post {
        success {
            echo "=========================================="
            echo "Pipeline executed successfully!"
            echo "Application is running at:"
            echo "  - Backend: http://YOUR_EC2_IP:3001"
            echo "  - Frontend: http://YOUR_EC2_IP:5174"
            echo "=========================================="
            
            // Send notification (optional)
            // You can add email/Slack notifications here
        }
        
        failure {
            echo "=========================================="
            echo "Pipeline failed! Check the logs above."
            echo "=========================================="
            
            // Cleanup on failure
            sh '''
                docker-compose -f docker-compose-jenkins.yml logs
                docker-compose -f docker-compose-jenkins.yml down
            '''
        }
        
        always {
            // Clean up workspace (optional)
            echo "Cleaning up workspace..."
            // cleanWs()
        }
    }
}

