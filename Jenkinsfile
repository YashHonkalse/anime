pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        REPO_NAME = 'anime'
        ACCOUNT_ID = '971422685558'
        ECR_URL = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}"
        CONTAINER_NAME = "must-watch-anime"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Get Branch Name') {
            steps {
                script {
                    def branchName = sh(
                        script: '''
                        git branch --remote --contains HEAD | grep -Eo 'origin/[^ ]+' | head -1 | sed 's|origin/||'
                        ''',
                        returnStdout: true
                    ).trim()

                    if (!branchName) {
                        branchName = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    }

                    env.BRANCH_NAME = branchName
                    echo "Branch: ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Get Commit Hash') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                script {
                    def hash = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG = hash
                    echo "Commit Hash: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Login to ECR') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                sh """
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL
                """
            }
        }

        stage('Build Docker Image') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                echo "Building image with tag: ${env.IMAGE_TAG}"
                sh """
                    docker build -t ${REPO_NAME}:${env.IMAGE_TAG} .
                    docker tag ${REPO_NAME}:${env.IMAGE_TAG} ${ECR_URL}:${env.IMAGE_TAG}
                """
            }
        }

        stage('Push to ECR') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                sh "docker push ${ECR_URL}:${env.IMAGE_TAG}"
            }
        }

        stage('Deploy Container') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${ECR_URL}:${env.IMAGE_TAG}
                """
            }
        }

        stage('Test Site') {
            when {
                expression { env.BRANCH_NAME == 'main' }
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
                docker container prune -f
                docker image prune -af
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
