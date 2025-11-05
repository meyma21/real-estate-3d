###########
# Builder #
###########
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom and download dependencies
COPY pom.xml ./
RUN mvn -q -B -e -DskipTests dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn -q -B -DskipTests clean package

############
# Runtime  #
############
FROM eclipse-temurin:17-jre-jammy AS runtime

WORKDIR /app

# Copy fat jar from builder
COPY --from=build /app/target/real-estate-3d-0.0.1-SNAPSHOT.jar /app/app.jar

# Railway exposes the container on the port your app listens to.
EXPOSE 8081

# Help avoid OOM on small plans
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
