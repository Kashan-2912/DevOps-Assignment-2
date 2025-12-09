pipeline {
    agent any
    triggers { githubPush() }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose-jenkins.yml'
        PROJECT_NAME = 'ezyshopper-jenkins'
        SELENIUM_TESTS_REPO = 'https://github.com/Kashan-2912/selenium-test-cases.git'
        GIT_REPO = 'https://github.com/Kashan-2912/DevOps-Assignment-2'
        GIT_BRANCH = 'main'
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
                script {
                    // Use a fresh directory per build to avoid permission issues on old files
                    env.SELENIUM_TESTS_DIR = "selenium-tests-${env.BUILD_NUMBER}"
                    env.SELENIUM_CONTAINER = "selenium-standalone-${env.BUILD_NUMBER}"
                    env.SELENIUM_NETWORK = "selenium-net-${env.BUILD_NUMBER}"
                    env.SELENIUM_ALIAS = "selenium-standalone"
                    echo "Using test workspace: ${env.SELENIUM_TESTS_DIR}"
                    sh "rm -rf ${env.SELENIUM_TESTS_DIR} || true"
                    sh "mkdir -p ${env.SELENIUM_TESTS_DIR}"
                    // Spin up Selenium Chrome with increased resources to prevent crashes
                    sh '''
                        set -e
                        docker network create ${SELENIUM_NETWORK} || true
                        docker rm -f ${SELENIUM_CONTAINER} || true
                        docker run -d --name ${SELENIUM_CONTAINER} --network ${SELENIUM_NETWORK} --network-alias ${SELENIUM_ALIAS} \
                            --shm-size=4g --memory=4g --cpus=1 \
                            -e SE_NODE_MAX_SESSIONS=1 \
                            -e SE_NODE_SESSION_TIMEOUT=300 \
                            -e SE_SESSION_REQUEST_TIMEOUT=300 \
                            selenium/standalone-chrome:4.26.0
                        
                        # Wait for Selenium to be ready
                        for i in {1..30}; do
                            if curl -sf http://${SELENIUM_ALIAS}:4444/status | grep -q '"ready":true'; then
                                echo "Selenium Grid is ready!"
                                exit 0
                            fi
                            echo "Waiting for Selenium Grid... ($i/30)"
                            sleep 2
                        done
                        echo "Warning: Selenium Grid health check timeout"
                    '''
                    // Clone selenium tests repo fresh each build
                    dir("${env.SELENIUM_TESTS_DIR}") {
                        git branch: 'main', url: "${SELENIUM_TESTS_REPO}"
                                                // Rename test file to match public class name (handle either folder layout)
                                                sh '''
                                                        if [ -f src/test/java/com/ezyshopper/tests/EzyShopperTests.java ]; then
                                                            mv src/test/java/com/ezyshopper/tests/EzyShopperTests.java src/test/java/com/ezyshopper/tests/EzyShopperAppTests.java
                                                        elif [ -f src/test/java/com/ezyshopper/EzyShopperTests.java ]; then
                                                            mv src/test/java/com/ezyshopper/EzyShopperTests.java src/test/java/com/ezyshopper/EzyShopperAppTests.java
                                                        fi
                                                '''
                        // Quick sanity checks
                        sh 'pwd && ls -la'
                        sh 'test -f pom.xml'
                    }
                    dir("${env.SELENIUM_TESTS_DIR}") {
                        // Run tests inside a Maven+JDK container to ensure mvn is available
                        docker.image('maven:3.9.6-eclipse-temurin-17').inside("--network ${env.SELENIUM_NETWORK}") {
                            withEnv([
                                "SELENIUM_REMOTE_URL=http://${env.SELENIUM_ALIAS}:4444/wd/hub",
                                "SELENIUM_ALIAS=${env.SELENIUM_ALIAS}"
                            ]) {
                                sh 'mvn --version'
                                sh "mvn clean test -DbaseUrl=http://13.234.238.153:5174 -DseleniumRemoteUrl=http://${env.SELENIUM_ALIAS}:4444/wd/hub"
                            }
                        }
                    }
                }
            }
        }

        stage('Publish Test Results') {
            steps {
                junit allowEmptyResults: true, testResults: "${env.SELENIUM_TESTS_DIR}/target/surefire-reports/*.xml"
            }
        }
    }

    post {
        always {
            script {
                sh '''
                    docker rm -f ${SELENIUM_CONTAINER} || true
                    docker network rm ${SELENIUM_NETWORK} || true
                '''
                // Get committer email - handle GitHub noreply addresses
                def committer = ''
                try {
                    // Try to get from last commit
                    committer = sh(
                        script: "git log -1 --pretty=format:%ae",
                        returnStdout: true
                    ).trim()
                    
                    // If it's a GitHub noreply address, replace with actual email
                    if (committer && committer.contains('users.noreply.github.com')) {
                        echo "Detected GitHub noreply address: ${committer}"
                        committer = 'kashan.ashraf2912@gmail.com'
                    }
                } catch (Exception e) {
                    echo "Could not determine committer email: ${e.message}"
                }
                
                // Fallback to default if still empty
                if (!committer || committer == '') {
                    committer = 'kashan.ashraf2912@gmail.com'
                }
                
                echo "Sending notification to: ${committer}"

                // Parse test results
                def testDir = env.SELENIUM_TESTS_DIR ?: 'selenium-tests'
                def raw = ''
                if (fileExists("${testDir}/target/surefire-reports")) {
                    raw = sh(
                        script: "grep -h '<testcase' ${testDir}/target/surefire-reports/*.xml || true",
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
