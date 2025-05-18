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

# Stage 2: Runtime
FROM openjdk:21-jdk-slim AS runtime

WORKDIR /app

# Copy the correct JAR file (backend-0.0.1-SNAPSHOT.jar)
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar ./app.jar

# Expose the backend port
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
