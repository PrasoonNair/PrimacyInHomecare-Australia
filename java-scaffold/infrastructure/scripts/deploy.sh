#!/bin/bash

# Production deployment script for Primacy Care Australia CMS
# Usage: ./deploy.sh [environment] [version]

set -e

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
NAMESPACE="primacy-care"
REGISTRY="primacycare"
APP_NAME="cms-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Primacy Care Australia CMS Deployment ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed${NC}"
        exit 1
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl is not installed${NC}"
        exit 1
    fi
    
    # Check Kubernetes context
    CURRENT_CONTEXT=$(kubectl config current-context)
    echo "Current Kubernetes context: $CURRENT_CONTEXT"
    
    if [[ "$ENVIRONMENT" == "production" && "$CURRENT_CONTEXT" != *"production"* ]]; then
        echo -e "${RED}Warning: Not in production context!${NC}"
        read -p "Continue with deployment? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo -e "${GREEN}Prerequisites check passed${NC}"
}

# Run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    
    # Run unit tests
    mvn test -Dspring.profiles.active=test
    
    # Run integration tests
    mvn verify -DskipUnitTests -Dspring.profiles.active=test
    
    # Run contract tests
    mvn test -Dtest=*ContractTest -Dspring.profiles.active=test
    
    echo -e "${GREEN}All tests passed${NC}"
}

# Build application
build_application() {
    echo -e "${YELLOW}Building application...${NC}"
    
    # Clean and package
    mvn clean package -DskipTests
    
    # Check build
    if [ ! -f "cms-api/target/cms-api-2.0.0-SNAPSHOT.jar" ]; then
        echo -e "${RED}Build failed: JAR file not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Build successful${NC}"
}

# Build Docker image
build_docker_image() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    
    IMAGE_TAG="$REGISTRY/$APP_NAME:$VERSION"
    
    # Build image
    docker build -t $IMAGE_TAG .
    
    # Tag for environment
    docker tag $IMAGE_TAG "$REGISTRY/$APP_NAME:$ENVIRONMENT-$VERSION"
    
    # Scan image for vulnerabilities
    echo "Scanning image for vulnerabilities..."
    docker scan $IMAGE_TAG --severity high || true
    
    echo -e "${GREEN}Docker image built: $IMAGE_TAG${NC}"
}

# Push to registry
push_to_registry() {
    echo -e "${YELLOW}Pushing to Docker registry...${NC}"
    
    # Login to registry
    echo "Please provide Docker registry credentials:"
    docker login
    
    # Push images
    docker push "$REGISTRY/$APP_NAME:$VERSION"
    docker push "$REGISTRY/$APP_NAME:$ENVIRONMENT-$VERSION"
    
    echo -e "${GREEN}Images pushed to registry${NC}"
}

# Database migration
run_database_migration() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Create migration job
    kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: database-migration-$VERSION
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: flyway
        image: flyway/flyway:latest
        command:
        - flyway
        - migrate
        env:
        - name: FLYWAY_URL
          valueFrom:
            secretKeyRef:
              name: primacy-cms-secrets
              key: database-url
        - name: FLYWAY_LOCATIONS
          value: "filesystem:/flyway/sql"
        volumeMounts:
        - name: migrations
          mountPath: /flyway/sql
      volumes:
      - name: migrations
        configMap:
          name: database-migrations
      restartPolicy: Never
EOF
    
    # Wait for migration to complete
    echo "Waiting for migration to complete..."
    kubectl wait --for=condition=complete --timeout=300s \
        job/database-migration-$VERSION -n $NAMESPACE
    
    echo -e "${GREEN}Database migration completed${NC}"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    echo -e "${YELLOW}Deploying to Kubernetes...${NC}"
    
    # Update deployment image
    kubectl set image deployment/$APP_NAME \
        $APP_NAME="$REGISTRY/$APP_NAME:$VERSION" \
        -n $NAMESPACE
    
    # Wait for rollout
    echo "Waiting for rollout to complete..."
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=600s
    
    # Check deployment
    REPLICAS=$(kubectl get deployment $APP_NAME -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    DESIRED=$(kubectl get deployment $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    
    if [ "$REPLICAS" != "$DESIRED" ]; then
        echo -e "${RED}Deployment failed: Only $REPLICAS/$DESIRED replicas ready${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Deployment successful: $REPLICAS/$DESIRED replicas ready${NC}"
}

# Run health checks
run_health_checks() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    # Get service URL
    if [ "$ENVIRONMENT" == "production" ]; then
        SERVICE_URL="https://api.primacycare.com.au"
    else
        SERVICE_URL="https://staging-api.primacycare.com.au"
    fi
    
    # Check health endpoint
    echo "Checking health endpoint..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/actuator/health")
    
    if [ "$HTTP_CODE" != "200" ]; then
        echo -e "${RED}Health check failed: HTTP $HTTP_CODE${NC}"
        exit 1
    fi
    
    # Check readiness
    echo "Checking readiness..."
    curl -f "$SERVICE_URL/actuator/health/readiness" || exit 1
    
    # Check liveness
    echo "Checking liveness..."
    curl -f "$SERVICE_URL/actuator/health/liveness" || exit 1
    
    echo -e "${GREEN}All health checks passed${NC}"
}

# Run smoke tests
run_smoke_tests() {
    echo -e "${YELLOW}Running smoke tests...${NC}"
    
    # Get service URL
    if [ "$ENVIRONMENT" == "production" ]; then
        SERVICE_URL="https://api.primacycare.com.au"
    else
        SERVICE_URL="https://staging-api.primacycare.com.au"
    fi
    
    # Test API endpoints
    echo "Testing API endpoints..."
    
    # Test participants endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TEST_TOKEN" \
        "$SERVICE_URL/api/participants")
    
    if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "401" ]; then
        echo -e "${RED}API test failed: HTTP $HTTP_CODE${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Smoke tests passed${NC}"
}

# Create rollback plan
create_rollback_plan() {
    echo -e "${YELLOW}Creating rollback plan...${NC}"
    
    # Get current deployment revision
    CURRENT_REVISION=$(kubectl get deployment $APP_NAME -n $NAMESPACE \
        -o jsonpath='{.metadata.annotations.deployment\.kubernetes\.io/revision}')
    
    # Save rollback command
    cat > rollback-$VERSION.sh <<EOF
#!/bin/bash
# Rollback script for version $VERSION
# Created: $(date)

echo "Rolling back to previous version..."
kubectl rollout undo deployment/$APP_NAME -n $NAMESPACE

echo "Waiting for rollback to complete..."
kubectl rollout status deployment/$APP_NAME -n $NAMESPACE

echo "Rollback completed"
EOF
    
    chmod +x rollback-$VERSION.sh
    
    echo -e "${GREEN}Rollback plan created: rollback-$VERSION.sh${NC}"
}

# Send notifications
send_notifications() {
    echo -e "${YELLOW}Sending notifications...${NC}"
    
    # Prepare message
    MESSAGE="Deployment completed successfully
Environment: $ENVIRONMENT
Version: $VERSION
Time: $(date)
Status: All checks passed"
    
    # Send to Slack (if configured)
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$MESSAGE\"}" \
            "$SLACK_WEBHOOK"
    fi
    
    # Send to Teams (if configured)
    if [ ! -z "$TEAMS_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$MESSAGE\"}" \
            "$TEAMS_WEBHOOK"
    fi
    
    echo -e "${GREEN}Notifications sent${NC}"
}

# Main deployment flow
main() {
    echo -e "${GREEN}Starting deployment process...${NC}"
    echo ""
    
    # Step 1: Prerequisites
    check_prerequisites
    
    # Step 2: Tests (skip in emergency)
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    else
        echo -e "${YELLOW}Warning: Skipping tests${NC}"
    fi
    
    # Step 3: Build
    build_application
    
    # Step 4: Docker
    build_docker_image
    push_to_registry
    
    # Step 5: Database
    run_database_migration
    
    # Step 6: Deploy
    deploy_to_kubernetes
    
    # Step 7: Verify
    sleep 10
    run_health_checks
    run_smoke_tests
    
    # Step 8: Rollback plan
    create_rollback_plan
    
    # Step 9: Notify
    send_notifications
    
    echo ""
    echo -e "${GREEN}=== Deployment Completed Successfully ===${NC}"
    echo "Environment: $ENVIRONMENT"
    echo "Version: $VERSION"
    echo "Time: $(date)"
    echo ""
    echo "Next steps:"
    echo "1. Monitor application metrics"
    echo "2. Check error logs"
    echo "3. Verify user access"
    echo ""
    echo "If issues occur, run: ./rollback-$VERSION.sh"
}

# Run main function
main