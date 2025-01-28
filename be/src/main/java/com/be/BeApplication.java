package com.be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

//@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
@SpringBootApplication
@EnableAspectJAutoProxy
public class BeApplication {
    public static void main(String[] args) {
        SpringApplication.run(BeApplication.class, args);
    }
    //Cross-Origin Resource Sharing (CORS)
    //http://localhost:5173/ 으로부터 오는 모든 요청 허용하기
//	@Bean
//	public WebMvcConfigurer corsConfigurer() {
//		return new WebMvcConfigurer() {
//			@Override
//			public void addCorsMappings(CorsRegistry registry) {
//				registry.addMapping("/**")
//						.allowedMethods("*")
//						.allowedOrigins("http://localhost:5173"); //http://localhost:5173에서만 오는 요청 허용
//			}
//		};
//	}
}