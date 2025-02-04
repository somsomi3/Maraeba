package com.be.domain.auth.controller;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.auth.service.TokenService;
import com.be.common.model.response.BaseResponseBody;
import com.be.domain.auth.dto.SocialUser;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.response.AccessTokenResponse;
import com.be.domain.auth.response.CheckEmailResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.GetAuthUrlResponse;
import com.be.domain.auth.response.KakaoLoginErrorResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;
import com.be.domain.auth.service.AuthService;
import com.be.domain.auth.service.KakaoSocialService;
import com.be.domain.auth.service.NaverSocialService;

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
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final TokenService tokenService;
	private final KakaoSocialService kakaoSocialService;
	private final NaverSocialService naverSocialService;

	@Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "회원가입 성공",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "409", description = "이미 존재하는 ID 또는 이메일")
	})
	@PostMapping("/register")
	public ResponseEntity<? extends BaseResponseBody> register(
		@Valid @RequestBody @Parameter(description = "회원가입 요청 데이터", required = true)
		RegisterRequest request) {
		authService.register(request);
		return ResponseEntity.ok(BaseResponseBody.of("User registered successfully", 200));
	}

	@Operation(summary = "아이디 중복 검사", description = "사용자의 아이디 중복 여부를 확인합니다.")
	@GetMapping("/check-user-id")
	public ResponseEntity<? extends BaseResponseBody> checkUserId(
		@RequestParam @Parameter(description = "중복 확인할 사용자 ID", required = true)
		String userId) {
		CheckUserIdResponse response = authService.checkUserId(userId);
		return ResponseEntity.status(response.getStatusCode()).body(response);
	}

	@Operation(summary = "이메일 중복 검사", description = "사용자의 이메일 중복 여부를 확인합니다.")
	@GetMapping("/check-email")
	@Deprecated
	public ResponseEntity<? extends BaseResponseBody> checkEmail(
		@RequestParam @Parameter(description = "중복 확인할 이메일", required = true)
		String email) {
		CheckEmailResponse response = authService.checkEmail(email);
		return ResponseEntity.status(response.getStatusCode()).body(response);
	}

	@Operation(summary = "로그인", description = "사용자의 로그인 요청을 처리합니다.")
	@PostMapping("/login")
	public ResponseEntity<? extends BaseResponseBody> login(
		@Valid @RequestBody @Parameter(description = "로그인 요청 데이터", required = true)
		LoginRequest request) {
		LoginResponse response = authService.login(request);
		ResponseCookie refreshTokenCookie = tokenService.createRefreshTokenCookie(response.getRefreshToken());

		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
			.body(AccessTokenResponse.from(response));
	}

	@Operation(summary = "Access Token 갱신", description = "만료된 Access Token을 Refresh Token을 통해 갱신합니다.")
	@PostMapping("/token")
	public ResponseEntity<? extends BaseResponseBody> tokenRefresh(
		@CookieValue(value = "refreshToken", required = false) String refreshToken) {

		if (refreshToken == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(BaseResponseBody.of("Refresh Token is missing", HttpStatus.UNAUTHORIZED.value()));
		}

		TokenRefreshResponse response = authService.tokenRefresh(refreshToken);
		ResponseCookie refreshTokenCookie = tokenService.createRefreshTokenCookie(response.getRefreshToken());
		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
			.body(AccessTokenResponse.from(response));
	}

	@Operation(summary = "로그아웃", description = "사용자의 로그아웃을 처리합니다.")
	@PostMapping("/logout")
	public ResponseEntity<? extends BaseResponseBody> logout(
		HttpServletRequest httpServletRequest) {

		//DB에서 Refresh Token 삭제 및 Access Token 블랙리스트 등록
		authService.logout(httpServletRequest);

		// Refresh Token 쿠키 삭제
		ResponseCookie refreshTokenCookie = tokenService.deleteRefreshTokenCookie();

		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
			.body(BaseResponseBody.of("Logout successfully", 200));
	}

	@Operation(summary = "카카오 로그인 요청", description = "카카오 소셜 로그인 URL을 반환합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "카카오 로그인 URL 반환 성공",
			content = @Content(schema = @Schema(implementation = GetAuthUrlResponse.class)))
	})
	@GetMapping("/kakao")
	public ResponseEntity<? extends BaseResponseBody> getKakaoAuthUrl() throws IOException {
		String kakaoAuthUrl = kakaoSocialService.getAuthorizationUrl();
		return ResponseEntity.ok(GetAuthUrlResponse.of(kakaoAuthUrl));
	}

	@Operation(summary = "카카오 로그인 콜백", description = "카카오 로그인 후 콜백을 처리합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "로그인 성공",
			content = @Content(schema = @Schema(implementation = AccessTokenResponse.class))),
		@ApiResponse(responseCode = "401", description = "로그인 실패 (인가 거부 등)",
			content = @Content(schema = @Schema(implementation = KakaoLoginErrorResponse.class)))
	})
	@GetMapping("/kakao/callback")
	public ResponseEntity<? extends BaseResponseBody> kakaoLogin(
		@RequestParam(required = false) String code,
		@RequestParam(required = false) String error,
		@RequestParam(required = false) String error_description
	) {
		if (error != null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(KakaoLoginErrorResponse.of(error_description, error));
		}

		String accessToken = kakaoSocialService.getAccessToken(code);
		SocialUser userInfo = kakaoSocialService.getUserInfo(accessToken);
		LoginResponse response = kakaoSocialService.socialLogin(userInfo);

		ResponseCookie refreshTokenCookie = tokenService.createRefreshTokenCookie(response.getRefreshToken());

		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
			.body(AccessTokenResponse.from(response));
	}

	@Operation(summary = "네이버 로그인 요청", description = "네이버 소셜 로그인 URL을 반환합니다.")
	@GetMapping("/naver")
	public ResponseEntity<? extends BaseResponseBody> getNaverAuthUrl() throws IOException {
		String naverAuthUrl = naverSocialService.getAuthorizationUrl();
		return ResponseEntity.ok(GetAuthUrlResponse.of(naverAuthUrl));
	}

	@Operation(summary = "네이버 로그인 콜백", description = "네이버 로그인 후 콜백을 처리합니다.")
	@GetMapping("/naver/callback")
	public ResponseEntity<SocialUser> naverLogin(@RequestParam("code") String code) {
		String accessToken = naverSocialService.getAccessToken(code);
		SocialUser userInfo = naverSocialService.getUserInfo(accessToken);
		return ResponseEntity.ok(userInfo);
	}
}
