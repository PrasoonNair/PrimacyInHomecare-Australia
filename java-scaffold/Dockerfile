# Multi-stage build for optimized production image
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom files for dependency caching
COPY pom.xml .
COPY */pom.xml ./*/

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY . .

# Build the application
RUN mvn clean package -DskipTests -B

# Runtime stage using distroless for security
FROM gcr.io/distroless/java21-debian12:latest

# Copy the JAR from builder
COPY --from=builder /app/cms-api/target/cms-api-*.jar /app/cms-api.jar

# Non-root user
USER 1000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD ["java", "-jar", "/app/cms-api.jar", "--health"]

# Expose port
EXPOSE 5000

# JVM optimizations for containers
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 \
  -XX:InitialRAMPercentage=50.0 \
  -XX:+UseG1GC \
  -XX:+UseStringDeduplication \
  -XX:+OptimizeStringConcat \
  -Djava.security.egd=file:/dev/./urandom"

# Run the application
ENTRYPOINT ["java", "-jar", "/app/cms-api.jar"]