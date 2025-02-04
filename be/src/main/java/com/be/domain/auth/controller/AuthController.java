package com.be.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.be.common.auth.TokenExtractorService;
import com.be.common.auth.TokenService;
import com.be.common.model.response.BaseResponseBody;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.LogoutRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.request.TokenRefreshRequest;
import com.be.domain.auth.response.CheckEmailResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;
import com.be.domain.auth.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AuthController {
	private final AuthService authService;
	private final TokenExtractorService tokenExtractorService;
	private final TokenService tokenService; // ✅ TokenService 추가

	@Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "회원가입 성공",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "409", description = "이미 존재하는 ID 또는 이메일")
	})
	@PostMapping("/auth/register")
	public ResponseEntity<? extends BaseResponseBody> register(
		@Valid @RequestBody @Parameter(description = "회원가입 요청 데이터", required = true)
		RegisterRequest request) {
		System.out.println("회원 등록 요청을 받음");
		authService.register(request);
		return ResponseEntity.ok(BaseResponseBody.of("User registered successfully", 200));
	}

	@Operation(summary = "아이디 중복 검사", description = "사용자의 아이디 중복 여부를 확인합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "중복 여부 반환",
			content = @Content(schema = @Schema(implementation = CheckUserIdResponse.class)))
	})
	@GetMapping("/auth/check-user-id")
	public ResponseEntity<? extends BaseResponseBody> checkUserId(
		@RequestParam @Parameter(description = "중복 확인할 사용자 ID", required = true)
		String userId) {
		CheckUserIdResponse response = authService.checkUserId(userId);
		return ResponseEntity.status(response.getStatusCode()).body(response);
	}

	@Operation(summary = "이메일 중복 검사", description = "사용자의 이메일 중복 여부를 확인합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "중복 여부 반환",
			content = @Content(schema = @Schema(implementation = CheckEmailResponse.class)))
	})
	@GetMapping("/auth/check-email")
	public ResponseEntity<? extends BaseResponseBody> checkEmail(
		@RequestParam @Parameter(description = "중복 확인할 이메일", required = true)
		String email) {
		CheckEmailResponse response = authService.checkEmail(email);
		return ResponseEntity.status(response.getStatusCode()).body(response);
	}

	@Operation(summary = "로그인", description = "사용자의 로그인 요청을 처리합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "로그인 성공",
			content = @Content(schema = @Schema(implementation = LoginResponse.class))),
		@ApiResponse(responseCode = "401", description = "잘못된 자격 증명"),
		@ApiResponse(responseCode = "403", description = "접근 거부 - 비밀번호 불일치")
	})
	@PostMapping("/auth/login")
	public ResponseEntity<? extends BaseResponseBody> login(
		@Valid @RequestBody @Parameter(description = "로그인 요청 데이터", required = true)
		LoginRequest request) {
		LoginResponse response = authService.login(request);
		return ResponseEntity.status(response.getStatusCode()).body(response);
	}

	@Operation(summary = "Access Token 갱신", description = "만료된 Access Token을 Refresh Token을 통해 갱신합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "토큰 갱신 성공",
			content = @Content(schema = @Schema(implementation = TokenRefreshResponse.class))),
		@ApiResponse(responseCode = "401", description = "Refresh Token이 만료됨")
	})
	@PostMapping("/token")
	public ResponseEntity<? extends BaseResponseBody> tokenRefresh(
		@Valid @RequestBody @Parameter(description = "Access Token 갱신 요청", required = true)
		TokenRefreshRequest request) {
		TokenRefreshResponse response = authService.tokenRefresh(request);
		return ResponseEntity.ok(response);
	}

	@Operation(summary = "로그아웃", description = "사용자의 로그아웃을 처리합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "로그아웃 성공",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class)))
	})
	@PostMapping("/logout")
	public ResponseEntity<? extends BaseResponseBody> logout(
		HttpServletRequest httpServletRequest,
		@Valid @RequestBody @Parameter(description = "로그아웃 요청 데이터", required = true)
		LogoutRequest request) {
		authService.logout(httpServletRequest, request);
		return ResponseEntity.ok(BaseResponseBody.of("Logout successfully", 200));
	}

	/**
	 * ✅ JWT 검증 API
	 */
	@GetMapping("/validate")
	@Operation(summary = "JWT 검증", description = "사용자의 Access Token이 유효한지 확인합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "토큰이 유효함"),
		@ApiResponse(responseCode = "401", description = "토큰이 유효하지 않음")
	})
	public ResponseEntity<BaseResponseBody> validateToken(HttpServletRequest request) {
		try {
			// ✅ TokenExtractorService를 사용하여 JWT 추출
			String token = tokenExtractorService.extractAccessToken(request);

			// ✅ JWT 검증 (TokenService 활용)
			if (!tokenService.validateToken(token)) {
				return ResponseEntity.status(401).body(BaseResponseBody.of("토큰이 유효하지 않습니다.", 401));
			}

			return ResponseEntity.ok(BaseResponseBody.of("토큰이 유효합니다.", 200));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(401).body(BaseResponseBody.of("토큰이 존재하지 않거나 올바르지 않습니다.", 401));
		}
	}

}
