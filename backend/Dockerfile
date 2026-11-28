# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
RUN MAVEN_OPTS="-Xmx384m" mvn -B dependency:go-offline

COPY src ./src
RUN MAVEN_OPTS="-Xmx384m" mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/eventreg-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xms128m", "-Xmx280m", "-Djava.awt.headless=true", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
