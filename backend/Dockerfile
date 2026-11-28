# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY maven-settings.xml pom.xml ./
COPY src ./src
RUN MAVEN_OPTS="-Xmx384m" mvn -B -s /app/maven-settings.xml \
    -Daether.connector.http.retryHandler.count=6 \
    -Daether.connector.http.retryHandler.interval=10000 \
    -Daether.connector.http.retryHandler.serviceUnavailable=429,503 \
    -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/eventreg-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xms128m", "-Xmx280m", "-Djava.awt.headless=true", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
