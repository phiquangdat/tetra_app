# Stage: Build
FROM openjdk:24-jdk-slim AS build

WORKDIR /app

# Copy Gradle Wrapper
COPY gradlew .
COPY gradle ./gradle

# Copy build scripts and source code
COPY build.gradle settings.gradle ./
COPY src ./src

# Make Gradle Wrapper executable
RUN chmod +x gradlew

# Clean and build the application (creates `build/libs/*.jar`)
RUN ./gradlew clean build --no-daemon

# Verify the contents of the JAR file (use grep instead of findstr)
RUN jar tf build/libs/backend-1.0.0.jar | grep TrainingModuleController

# Stage 2: Runtime
FROM openjdk:24-jdk-slim AS runtime

WORKDIR /app

# Copy the correct JAR file (backend-1.0.0.jar)
COPY --from=build /app/build/libs/backend-1.0.0.jar ./app.jar

# Copy application.properties to the correct location in the container
COPY src/main/resources/application.properties ./application.properties

# Expose the backend port
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
