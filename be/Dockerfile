# 1. Gradle 빌드를 위한 기본 이미지 (Gradle 8.11.1 사용)
FROM gradle:8.11.1-jdk17 AS build

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 프로젝트 파일 복사
COPY . .

# 4. Gradle Wrapper로 Spring Boot 애플리케이션 빌드
RUN ./gradlew clean bootJar --no-daemon

# 5. 경량화된 JDK 이미지 사용
FROM openjdk:17-jdk-slim

# 6. 작업 디렉토리 설정
WORKDIR /app

# 7. 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 8. 컨테이너에서 사용할 포트 노출
EXPOSE 8081

# 9. 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
