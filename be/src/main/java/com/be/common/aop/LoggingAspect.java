package com.be.common.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Aspect
@Component
public class LoggingAspect {

	@Pointcut("execution(* com.be..controller..*(..)) || execution(* com.be..service..*(..))")
	public void pointcut() {
	}

	@Before("pointcut()")
	public void logMethodInputs(JoinPoint joinPoint) {
		String className = joinPoint.getTarget().getClass().getSimpleName(); // 클래스 이름
		String methodName = joinPoint.getSignature().getName(); // 메서드 이름
		Object[] args = joinPoint.getArgs(); // 파라미터

		log.info("메서드 호출: {}.{} - 입력 파라미터: {}", className, methodName, args);
	}

	@AfterReturning(value = "pointcut()", returning = "result")
	public void logMethodOutputs(JoinPoint joinPoint, Object result) {
		String className = joinPoint.getTarget().getClass().getSimpleName(); // 클래스 이름
		String methodName = joinPoint.getSignature().getName(); // 메서드 이름

		log.info("메서드 반환: {}.{} - 반환값: {}", className, methodName, result);
	}
}
