package com.be.common.auth;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.be.common.auth.model.CustomUserDetails;
import com.be.common.auth.service.TokenService;
import com.be.common.exception.CustomTokenException;
import com.be.common.exception.TokenErrorCode;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT를 사용하기 위한 커스텀 필터
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final TokenService tokenService;

	@Override
	protected void doFilterInternal(
		@NonNull HttpServletRequest request,
		@NonNull HttpServletResponse response,
		@NonNull FilterChain filterChain) throws ServletException, IOException {

		String requestURI = request.getRequestURI();
		log.info("Request URI: {}", requestURI);

		// WebSocket Handshake 요청(`/WebRTC/signaling`)은 필터에서 제외
		if (requestURI.startsWith("/WebRTC/signaling")) {
			log.info("WebSocket Handshake 요청 - JWT 필터 제외");
			filterChain.doFilter(request, response);
			return;
		}

		// Swagger 관련 요청은 필터를 그냥 통과시킴
		if (requestURI.startsWith("/swagger") ||
			requestURI.startsWith("/swagger-ui") ||
			requestURI.startsWith("/v3/api-docs") ||
			requestURI.startsWith("/swagger-resources") ||
			requestURI.startsWith("/webjars")
		) {
			filterChain.doFilter(request, response);
			return;
		}

		// /auth 관련 요청(logout제외)은 필터를 그냥 통과시킴
		if (requestURI.startsWith("/auth") && !requestURI.equals("/auth/logout")) {
			log.info("/auth 관련 요청(logout 제외)은 필터를 그냥 통과시킴");
			filterChain.doFilter(request, response);
			return;
		}

		// 파비콘 요청이면 필터 통과
		if ("/favicon.ico".equals(requestURI)) {
			log.info("/favicon.ico 요청은 필터를 그냥 통과시킴");
			filterChain.doFilter(request, response);
			return;
		}

		try {
			String token = tokenService.extractAccessToken(request);
			log.info("Extracted Token: {}", token);

			// 토큰이 없을 경우 AuthenticationEntryPoint로 전달
			if (token == null) {
				log.warn("AccessToken이 존재하지 않음 - 401 Unauthorized 반환");
				throw new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN);
			}

			// 토큰 검증
			// 토큰 검증
			if (!tokenService.validateToken(token)) {
				log.warn("AccessToken 검증 실패 - 401 Unauthorized 반환");
				throw new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN);
			}

			Long id = tokenService.extractUserIdFromToken(token)
				.orElseThrow(() -> new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN));
			log.info("User ID from Token: {}", id);

			// UserDetails 가져오기
			CustomUserDetails userDetails = new CustomUserDetails(id);

			// 인증 객체 생성 및 Security Context에 저장
			UsernamePasswordAuthenticationToken authentication =
				new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

			SecurityContextHolder.getContext().setAuthentication(authentication);

		} catch (CustomTokenException e) {
			log.warn("JWT Filter - Invalid Token: {}", e.getMessage());
		} catch (Exception e) {
			// 예외 발생 시 로그 기록 (필요하면 response에 메시지 반환 가능)
			log.error("JWT Filter Exception: {}", e.getMessage(), e);
		}
		// 다음 필터로 진행
		filterChain.doFilter(request, response);

	}
}