package com.be.domain.auth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
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
import com.be.domain.auth.dto.SocialUserDTO;
import com.be.domain.auth.dto.UserIdResponseDto;
import com.be.domain.auth.request.FindUserIdRequest;
import com.be.domain.auth.request.ForgotPasswordRequest;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.PasswordResetRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.response.AccessTokenResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.FindUserIdsResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;
import com.be.domain.auth.service.AuthService;
import com.be.domain.auth.service.KakaoSocialService;

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
	// private final NaverSocialService naverSocialService;

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

		TokenRefreshResponse response = authService.tokenRefresh(refreshToken);
		ResponseCookie refreshTokenCookie = tokenService.createRefreshTokenCookie(response.getRefreshToken());
		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
			.body(AccessTokenResponse.from(response));
	}

	@PostMapping("/reset-password")
	@Operation(summary = "비밀번호 재설정", description = "비밀번호 변경 토큰을 사용하여 새로운 비밀번호를 설정합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "비밀번호 변경 성공",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "401", description = "비밀번호 변경 토큰이 만료됨",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "404", description = "비밀번호 변경 토큰이 존재하지 않음",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class)))
	})
	public ResponseEntity<? extends BaseResponseBody> resetPassword(
		@RequestBody @Valid @Parameter(description = "비밀번호 변경 요청 데이터", required = true)
		PasswordResetRequest request) {

		authService.resetPassword(request);
		return ResponseEntity.ok(BaseResponseBody.of("비밀번호가 성공적으로 변경되었습니다.", 200));
	}


	@Operation(summary = "로그아웃", description = "사용자의 로그아웃을 처리합니다.")
	@PostMapping("/logout")
	public ResponseEntity<? extends BaseResponseBody> logout(
		@CookieValue(value = "refreshToken", required = false) String refreshToken,
		HttpServletRequest httpServletRequest) {

		//DB에서 Refresh Token 삭제 및 Access Token 블랙리스트 등록
		authService.logout(refreshToken, httpServletRequest);

		// Refresh Token 쿠키 삭제
		ResponseCookie refreshTokenCookie = tokenService.deleteRefreshTokenCookie();

		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
			.body(BaseResponseBody.of("Logout successfully", 200));
	}

	@Operation(summary = "카카오 로그인 처리", description = "프론트에서 받은 인가코드를 사용해 카카오 로그인 처리")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "로그인 성공",
			content = @Content(schema = @Schema(implementation = AccessTokenResponse.class))),
		@ApiResponse(responseCode = "400", description = "잘못된 요청 (인가코드 누락)"),
		@ApiResponse(responseCode = "401", description = "카카오 로그인 실패")
	})
	@PostMapping("/kakao/callback")
	public ResponseEntity<? extends BaseResponseBody> kakaoLogin(@RequestBody Map<String, String> requestBody) {
		String code = requestBody.get("code");

		String accessToken = kakaoSocialService.getAccessToken(code);
		SocialUserDTO userInfo = kakaoSocialService.getUserInfo(accessToken);
		LoginResponse response = kakaoSocialService.socialLogin(userInfo);

		ResponseCookie refreshTokenCookie = tokenService.createRefreshTokenCookie(response.getRefreshToken());

		return ResponseEntity.ok()
			.header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString()) // Refresh Token은 쿠키에 저장
			.body(AccessTokenResponse.from(response)); // Access Token은 JSON으로 전달
	}


	/**
	 * JWT 검증 API
	 */
	@GetMapping("/validate")
	@Operation(summary = "JWT 검증", description = "사용자의 Access Token이 유효한지 확인합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "토큰이 유효함"),
		@ApiResponse(responseCode = "401", description = "토큰이 유효하지 않음")
	})
	public ResponseEntity<BaseResponseBody> validateToken(HttpServletRequest request) {
		authService.validateToken(request);
		return ResponseEntity.ok(BaseResponseBody.of("토큰이 유효합니다.", 200));
	}

	@PostMapping("/find-id")
	@Operation(summary = "아이디 찾기", description = "이메일을 입력하여 해당 이메일과 연결된 사용자 ID 목록을 조회합니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "유저 아이디 발견",
			content = @Content(schema = @Schema(implementation = FindUserIdsResponse.class))),
		@ApiResponse(responseCode = "404", description = "해당 이메일의 유저가 없습니다",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class)))
	})
	public ResponseEntity<? extends BaseResponseBody> findUserIds(
		@RequestBody @Parameter(description = "아이디 찾기를 위한 이메일 요청 데이터", required = true)
		FindUserIdRequest request) {

		List<UserIdResponseDto> userIds = authService.findUserIdsByEmail(request);

		return ResponseEntity.ok(FindUserIdsResponse.of("유저 아이디 발견", 200, userIds));
	}

	@PostMapping("/forgot-password")
	@Operation(summary = "비밀번호 찾기", description = "사용자의 아이디와 이메일을 입력하여 비밀번호 변경 주소를 발급받습니다.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "비밀번호 변경 주소 전송 완료",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class))),
		@ApiResponse(responseCode = "404", description = "아이디 또는 이메일이 일치하는 사용자가 없습니다",
			content = @Content(schema = @Schema(implementation = BaseResponseBody.class)))
	})
	public ResponseEntity<? extends BaseResponseBody> forgotPassword(
		@RequestBody @Valid @Parameter(description = "비밀번호 찾기 요청 데이터", required = true)
		ForgotPasswordRequest request) {

		authService.sendPasswordResetLink(request);
		return ResponseEntity.ok(BaseResponseBody.of("비밀번호 변경 주소를 이메일로 전송했습니다.", 200));
	}

	// @Operation(summary = "네이버 로그인 요청", description = "네이버 소셜 로그인 URL을 반환합니다.")
	// @GetMapping("/naver")
	// public ResponseEntity<? extends BaseResponseBody> getNaverAuthUrl() {
	// 	String naverAuthUrl = naverSocialService.getAuthorizationUrl();
	// 	return ResponseEntity.ok(GetAuthUrlResponse.of(naverAuthUrl));
	// }
	//
	// @Operation(summary = "네이버 로그인 콜백", description = "네이버 로그인 후 콜백을 처리합니다.")
	// @GetMapping("/naver/callback")
	// public ResponseEntity<? extends BaseResponseBody> naverLogin(@RequestParam("code") String code) {
	// 	String accessToken = naverSocialService.getAccessToken(code);
	// 	SocialUserDTO userInfo = naverSocialService.getUserInfo(accessToken);
	// 	return null;
	// }
}
