package com.be.domain.auth.controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.auth.dto.SocialUser;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.LogoutRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.request.TokenRefreshRequest;
import com.be.domain.auth.response.CheckEmailResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.GetAuthUrlResponse;
import com.be.domain.auth.response.KakaoLoginErrorResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.SocialLoginSuccessResponse;
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
		System.out.println("회원 등록 요청을 받음");
		authService.register(request);
		return ResponseEntity.ok(BaseResponseBody.of("User registered successfully", 200));
	}

	@Operation(summary = "아이디 중복 검사", description = "사용자의 아이디 중복 여부를 확인합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "중복 여부 반환",
			content = @Content(schema = @Schema(implementation = CheckUserIdResponse.class)))
	})
	@GetMapping("/check-user-id")
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
	@GetMapping("/check-email")
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
	@PostMapping("/login")
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

	@GetMapping("/kakao")
	public ResponseEntity<? extends BaseResponseBody> getKakaoAuthUrl() throws
		IOException {
		String kakaoAuthUrl = kakaoSocialService.getAuthorizationUrl();
		return ResponseEntity.ok(GetAuthUrlResponse.of(kakaoAuthUrl));
	}

	@GetMapping("/kakao/callback")
	public ResponseEntity<? extends BaseResponseBody> kakaoLogin(
		@RequestParam(required = false) String code,
		@RequestParam(required = false) String error,
		@RequestParam(required = false) String error_description
	) {
		// 소셜 로그인 실패 처리
		if (error != null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(KakaoLoginErrorResponse.of(error_description, error));
		}

		String accessToken = kakaoSocialService.getAccessToken(code);
		SocialUser userInfo = kakaoSocialService.getUserInfo(accessToken);
		return ResponseEntity.ok(
			SocialLoginSuccessResponse.of(userInfo.getProvider(), userInfo.getProviderId(), userInfo.getEmail(),
				userInfo.getNickname()));
	}

	@GetMapping("/naver")
	public ResponseEntity<? extends BaseResponseBody> getNaverAuthUrl() throws
		IOException {
		String naverAuthUrl = naverSocialService.getAuthorizationUrl();
		return ResponseEntity.ok(GetAuthUrlResponse.of(naverAuthUrl));
	}

	@GetMapping("/naver/callback")
	public ResponseEntity<SocialUser> naverLogin(@RequestParam("code") String code) {
		String accessToken = naverSocialService.getAccessToken(code);
		SocialUser userInfo = naverSocialService.getUserInfo(accessToken);
		return ResponseEntity.ok(userInfo);
	}

}
