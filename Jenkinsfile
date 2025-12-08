pipeline {
    agent any
    triggers { githubPush() }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose-jenkins.yml'
        PROJECT_NAME = 'ezyshopper-jenkins'
        SELENIUM_TESTS_REPO = 'https://github.com/Kashan-2912/selenium-test-cases.git'
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

        stage('Cleanup') {
            steps {
                script {
                    echo 'Cleaning up previous containers...'
                    sh 'docker-compose -f docker-compose-jenkins.yml down -v || true'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Starting containerized application...'
                    sh 'docker-compose -f docker-compose-jenkins.yml up -d --build'
                    sh 'sleep 30' // Give app time to start
                }
            }
        }

        stage('Verify') {
            steps {
                script {
                    echo 'Verifying containers are running...'
                    sh 'docker ps'
                }
            }
        }

        stage('Run Selenium Tests') {
            steps {
                dir('selenium-tests') {
                    git branch: 'main', url: "${SELENIUM_TESTS_REPO}"
                    sh 'mvn clean test -DbaseUrl=http://13.234.238.153:5174 || true'
                }
            }
        }

        stage('Publish Test Results') {
            steps {
                junit allowEmptyResults: true, testResults: 'selenium-tests/target/surefire-reports/*.xml'
            }
        }
    }

    post {
        always {
            script {
                // Get committer email
                def committer = ''
                dir('selenium-tests') {
                    if (fileExists('.git')) {
                        committer = sh(
                            script: "git log -1 --pretty=format:%ae",
                            returnStdout: true
                        ).trim()
                    }
                }
                if (!committer || committer == '') {
                    committer = 'mkashan2912@gmail.com'  // Default email
                }

                // Parse test results
                def raw = ''
                if (fileExists('selenium-tests/target/surefire-reports')) {
                    raw = sh(
                        script: "grep -h '<testcase' selenium-tests/target/surefire-reports/*.xml || true",
                        returnStdout: true
                    ).trim()
                }

                int total = 0, passed = 0, failed = 0, skipped = 0
                def details = ""

                if (raw) {
                    raw.split('\n').each { line ->
                        total++
                        def m = (line =~ /name="([^"]+)"/)
                        def name = m ? m[0][1] : "Unknown Test"
                        if (line.contains("<failure")) {
                            failed++
                            details += "❌ Failed: ${name}\n"
                        } else if (line.contains("<skipped") || line.contains("</skipped>")) {
                            skipped++
                            details += "⏭️ Skipped: ${name}\n"
                        } else {
                            passed++
                            details += "✅ Passed: ${name}\n"
                        }
                    }
                } else {
                    details = "No test results found (tests may have failed to run)."
                }

                def color = currentBuild.currentResult == 'SUCCESS' ? '#28a745' : '#dc3545'
                def statusEmoji = currentBuild.currentResult == 'SUCCESS' ? '✅' : '❌'

                def emailBody = """
                    <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2 style="color: ${color};">${statusEmoji} EzyShopper E-Commerce CI – Build #${env.BUILD_NUMBER}</h2>
                        <p><strong>Status:</strong> <span style="color:${color}; font-size:20px;">${currentBuild.currentResult}</span></p>
                        <p><strong>Triggered by:</strong> ${currentBuild.getBuildCauses()[0].shortDescription}</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>

                        <h3>🧪 Test Results Summary</h3>
                        <table style="border-collapse: collapse; margin: 10px 0;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Tests</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${total}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Passed</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd; color: green;">${passed}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Failed</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd; color: red;">${failed}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Skipped</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${skipped}</td>
                            </tr>
                        </table>

                        <h4>📋 Detailed Results:</h4>
                        <pre style="background:#f4f4f4; padding:15px; border-radius:8px; font-size:14px;">${details}</pre>

                        <hr>
                        <p>
                            <a href="${env.BUILD_URL}" style="color:#007bff; text-decoration:none;">🔗 View Full Build</a> |
                            <a href="${env.BUILD_URL}testReport/" style="color:#007bff; text-decoration:none;">📊 View Test Report</a>
                        </p>
                        <small style="color:#666;">Sent from EzyShopper E-Commerce CI Pipeline</small>
                    </body>
                    </html>
                """

                emailext(
                    to: committer,
                    subject: "EzyShopper CI #${env.BUILD_NUMBER} – ${currentBuild.currentResult} (${passed}/${total} Passed)",
                    body: emailBody,
                    mimeType: 'text/html',
                    attachLog: true,
                    compressLog: true
                )
            }
        }

        success {
            echo 'Pipeline completed successfully!'
            echo 'Frontend: http://13.234.238.153:5174'
        }

        failure {
            echo 'Pipeline failed!'
            sh 'docker-compose -f docker-compose-jenkins.yml logs || true'
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

