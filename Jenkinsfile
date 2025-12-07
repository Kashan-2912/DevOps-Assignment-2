

pipeline {
    agent any
    
    environment {
        // Define your Docker Hub credentials ID (configured in Jenkins)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        
        // Git repository URL
        GIT_REPO = 'https://github.com/Kashan-2912/DevOps-Assignment-2.git'
        GIT_BRANCH = 'main'
        
        // Selenium test repository
        TEST_REPO = 'https://github.com/Kashan-2912/selenium-test-cases.git'
        TEST_BRANCH = 'main'
        
        // Application name
        APP_NAME = 'ezyshopper'
        
        // Application URLs (for Selenium tests)
        FRONTEND_URL = 'http://13.234.238.153:5174'
        BACKEND_URL = 'http://13.234.238.153:3001'
        
        // Email notification (fallback if git committer email not found)
        DEFAULT_EMAIL = 'mkashan2912@gmail.com'
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
        
        stage('Run Selenium Tests') {
            steps {
                script {
                    echo "========== Stage 6: Running Selenium Tests =========="
                }
                
                // Clean up old selenium-tests directory to fix permission issues
                sh '''
                    echo "Force-cleaning selenium-tests using Docker root..."
                    docker run --rm -v $(pwd):/workspace alpine sh -c "rm -rf /workspace/selenium-tests"
                '''
                
                // Clone selenium test repository
                dir('selenium-tests') {
                    git branch: "${TEST_BRANCH}",
                        url: "${TEST_REPO}"
                    
                    echo "Selenium test repository cloned successfully!"
                }
                
                // Run Selenium tests in Docker container
                sh '''
                    echo "Running Selenium tests in Docker container..."
                    
                    docker run --rm \
                        --name selenium-test-runner \
                        --network host \
                        -v $(pwd)/selenium-tests:/tests \
                        -w /tests \
                        -e BASE_URL=http://13.234.238.153:5174 \
                        -e BACKEND_URL=http://13.234.238.153:3001 \
                        markhobson/maven-chrome:latest \
                        mvn clean test -DbaseUrl=http://13.234.238.153:5174
                    
                    # Fix permissions on generated files
                    chmod -R 755 selenium-tests/target || true
                '''
                
                echo "Selenium tests completed successfully!"
            }
        }
    }
    
    post {
        success {
            script {
                echo "=========================================="
                echo "Pipeline executed successfully!"
                echo "All tests passed!"
                echo "Application is running at:"
                echo "  - Backend: http://13.234.238.153:3001"
                echo "  - Frontend: http://13.234.238.153:5174"
                echo "=========================================="
                
                // Archive test results
                junit '**/target/surefire-reports/*.xml'
                
                // Note: HTML test reports available in Jenkins artifacts
                archiveArtifacts artifacts: 'selenium-tests/target/surefire-reports/**/*', allowEmptyArchive: true
                
                // Get committer email or use default
                def committerEmail = ''
                try {
                    committerEmail = sh(
                        script: "git --no-pager show -s --format='%ae' HEAD",
                        returnStdout: true
                    ).trim()
                } catch (Exception e) {
                    committerEmail = env.DEFAULT_EMAIL
                }
                
                if (!committerEmail) {
                    committerEmail = env.DEFAULT_EMAIL
                }
                
                // Send success email with test results
                emailext(
                    subject: "✅ Jenkins Build SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <html>
                        <body>
                            <h2 style="color: green;">✅ Build Successful!</h2>
                            <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                            <p><strong>Branch:</strong> ${env.GIT_BRANCH}</p>
                            
                            <h3>Application URLs:</h3>
                            <ul>
                                <li><strong>Frontend:</strong> <a href="http://13.234.238.153:5174">http://13.234.238.153:5174</a></li>
                                <li><strong>Backend:</strong> <a href="http://13.234.238.153:3001">http://13.234.238.153:3001</a></li>
                            </ul>
                            
                            <h3>✅ All Selenium Tests Passed!</h3>
                            <p>All automated tests executed successfully.</p>
                            
                            <h3>Test Reports:</h3>
                            <ul>
                                <li><a href="${env.BUILD_URL}testReport/">JUnit Test Results</a></li>
                                <li><a href="${env.BUILD_URL}artifact/selenium-tests/target/surefire-reports/">Selenium Test Reports (Artifacts)</a></li>
                            </ul>
                            
                            <p><em>Build completed at: ${new Date()}</em></p>
                        </body>
                        </html>
                    """,
                    to: committerEmail,
                    mimeType: 'text/html',
                    attachLog: false,
                    attachmentsPattern: 'selenium-tests/target/surefire-reports/*.xml'
                )
            }
        }
        
        failure {
            script {
                echo "=========================================="
                echo "Pipeline failed! Check the logs above."
                echo "=========================================="
                
                // Archive test results even on failure
                junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
                
                // Archive HTML test reports
                archiveArtifacts artifacts: 'selenium-tests/target/surefire-reports/**/*', allowEmptyArchive: true
                
                // Get committer email or use default
                def committerEmail = ''
                try {
                    committerEmail = sh(
                        script: "git --no-pager show -s --format='%ae' HEAD",
                        returnStdout: true
                    ).trim()
                } catch (Exception e) {
                    committerEmail = env.DEFAULT_EMAIL
                }
                
                if (!committerEmail) {
                    committerEmail = env.DEFAULT_EMAIL
                }
                
                // Send failure email with test results
                emailext(
                    subject: "❌ Jenkins Build FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <html>
                        <body>
                            <h2 style="color: red;">❌ Build Failed!</h2>
                            <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                            <p><strong>Branch:</strong> ${env.GIT_BRANCH}</p>
                            
                            <h3>Failure Details:</h3>
                            <p>The pipeline failed during execution. Please check the console output for details.</p>
                            
                            <h3>Console Output:</h3>
                            <p><a href="${env.BUILD_URL}console">View Full Console Output</a></p>
                            
                            <h3>Test Reports (if available):</h3>
                            <ul>
                                <li><a href="${env.BUILD_URL}testReport/">JUnit Test Results</a></li>
                                <li><a href="${env.BUILD_URL}artifact/selenium-tests/target/surefire-reports/">Selenium Test Reports (Artifacts)</a></li>
                            </ul>
                            
                            <p><strong>Action Required:</strong> Please review the logs and fix the issues.</p>
                            <p><em>Build failed at: ${new Date()}</em></p>
                        </body>
                        </html>
                    """,
                    to: committerEmail,
                    mimeType: 'text/html',
                    attachLog: true,
                    attachmentsPattern: 'selenium-tests/target/surefire-reports/*.xml'
                )
                
                // Cleanup on failure
                sh '''
                    docker-compose -f docker-compose-jenkins.yml logs
                    docker-compose -f docker-compose-jenkins.yml down
                '''
            }
        }
        
        always {
            echo "Cleaning up workspace..."
            // cleanWs()
        }
    }
}

