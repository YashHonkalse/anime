
pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1a'
        REPO_NAME = 'anime'
        ACCOUNT_ID = '971422685558' // 
        ECR_URL = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}"
        CONTAINER_NAME = "must-watch-anime"
    }

    options {
        skipDefaultCheckout()
    }

    stages {
        stage('Checkout') {
            when {
                branch 'main'  // 👈 Only run on 'main' branch
            }
            steps {
                checkout scm
                script {
                    COMMIT_HASH = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    IMAGE_TAG = COMMIT_HASH
                    echo "Commit Hash: ${COMMIT_HASH}"
                }
            }
        }

        stage('Login to ECR') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL
                """
            }
        }

        stage('Build Docker Image') {
            when {
                branch 'main'
            }
            steps {
                echo "Building image tagged with commit: ${IMAGE_TAG} and latest"
                sh """
                    docker build -t ${REPO_NAME}:${IMAGE_TAG} .
                    docker tag ${REPO_NAME}:${IMAGE_TAG} ${ECR_URL}:${IMAGE_TAG}
                    docker tag ${REPO_NAME}:${IMAGE_TAG} ${ECR_URL}:latest
                """
            }
        }

        stage('Push to ECR') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    docker push ${ECR_URL}:${IMAGE_TAG}
                    docker push ${ECR_URL}:latest
                """
            }
        }

        stage('Deploy Container') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${ECR_URL}:latest
                """
            }
        }

        stage('Test Site') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Waiting for app to start..."
                    sleep 5
                    def response = sh(script: "curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3000", returnStdout: true).trim()
                    if (response != '200') {
                        error "Application is not responding correctly. HTTP code: ${response}"
                    } else {
                        echo "✅ Site is up and running!"
                    }
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up...'
            sh '''
                docker image prune -af
                docker container prune -f
                docker system prune -f
                rm -rf *
            '''
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check logs above."
        }
    }
}
