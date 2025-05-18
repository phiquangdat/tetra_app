# Stage: Build
FROM openjdk:21-jdk-slim AS build

WORKDIR /app

# Copy Gradle Wrapper
COPY gradlew .
COPY gradle ./gradle

# Copy build scripts and source code
COPY build.gradle settings.gradle ./
COPY src ./src

# Make Gradle Wrapper executable
RUN chmod +x gradlew

# Build the application (creates `build/libs/*.jar`)
RUN ./gradlew build --no-daemon

# 2️ Stage: Runtime
FROM openjdk:21-jdk-slim

WORKDIR /app

# **Key difference:** Copy JAR from the build stage
COPY --from=build /app/build/libs/*.jar ./app.jar

# Expose backend port
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
