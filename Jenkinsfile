pipeline {
    agent any // This will run on any available Jenkins agent

    stages {
        stage('1. Checkout Code') {
            steps {
                // This automatically fetches the code from your GitHub repository
                checkout scm
            }
        }

        stage('2. Build Docker Image') {
            steps {
                script {
                    // This builds the Docker image and tags it with the build number
                    // for easy tracking.
                    sh 'docker build -t major-project:$BUILD_NUMBER .'
                }
            }
        }

        stage('3. Deploy Application') {
            steps {
                script {
                    // Stop and remove the old container if it exists, to avoid conflicts
                    sh 'docker stop my-app-container || true'
                    sh 'docker rm my-app-container || true'

                    // Run the new container from the newly built image in the background
                    sh 'docker run -d --name my-app-container -p 8080:3000 major-project:$BUILD_NUMBER'
                }
            }
        }
    }
}