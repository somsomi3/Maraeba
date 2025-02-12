package com.be.domain.auth.service;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.be.common.auth.TokenType;
import com.be.common.auth.service.TokenService;
import com.be.common.exception.AuthErrorCode;
import com.be.common.exception.CustomAuthException;
import com.be.common.exception.CustomException;
import com.be.common.exception.CustomTokenException;
import com.be.common.exception.ErrorCode;
import com.be.common.exception.TokenErrorCode;
import com.be.db.entity.PasswordResetToken;
import com.be.db.entity.RefreshToken;
import com.be.db.entity.User;
import com.be.db.repository.PasswordResetTokenRepository;
import com.be.db.repository.RefreshTokenRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.auth.dto.UserIdResponseDto;
import com.be.domain.auth.request.FindUserIdRequest;
import com.be.domain.auth.request.ForgotPasswordRequest;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.PasswordResetRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	@Value("${password.reset.base-url}")
	private String passwordResetBaseUrl;

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final TokenService tokenService;
	private final EmailService emailService;
	private final PasswordResetTokenRepository passwordResetTokenRepository;

	/**
	 * 회원가입
	 */
	@Transactional
	@Override
	public void register(RegisterRequest request) {
		// 1. userId 중복 검사
		if (userRepository.findByUserId(request.getUserId()).isPresent()) {
			throw new CustomAuthException(AuthErrorCode.USER_ID_DUPLICATE);
		}

		// 2. 입력값 검증
		if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
			throw new CustomAuthException(AuthErrorCode.INVALID_USER_ID);
		}
		if (request.getPassword() == null || request.getPassword().length() < 4) {
			throw new CustomAuthException(AuthErrorCode.WEAK_PASSWORD);
		}
		if (!isValidEmail(request.getEmail())) {
			throw new CustomAuthException(AuthErrorCode.INVALID_EMAIL);
		}
		// 3. 비밀번호 암호화 후 저장
		try {
			User user = new User();
			user.setUserId(request.getUserId());
			user.setPassword(passwordEncoder.encode(request.getPassword()));
			user.setEmail(request.getEmail());
			user.setUsername(request.getUsername());
			user.setProvider("LOCAL");
			user.setProviderId(null);
			userRepository.save(user);
		} catch (Exception e) {
			throw new CustomException(ErrorCode.DATABASE_ERROR, "유저 DB 저장 에러 "+e.getMessage());
		}
	}

	/**
	 * 아이디 중복 검사
	 */
	@Override
	public CheckUserIdResponse checkUserId(String userId) {
		// 1. 아이디 유효성 검사
		if (userId == null || userId.trim().isEmpty() || userId.length() < 4) {
			throw new CustomAuthException(AuthErrorCode.INVALID_USER_ID);
		}

		// 2. 중복 검사
		boolean exists = userRepository.findByUserId(userId).isPresent();
		if (exists) {
			throw new CustomAuthException(AuthErrorCode.USER_ID_DUPLICATE);
		}

		// 3. 사용 가능한 ID
		return CheckUserIdResponse.of("User ID is available.", 200, userId, false);
	}

	/**
	 * 로그인 (Access Token, Refresh Token 발급)
	 */
	@Transactional
	@Override
	public LoginResponse login(LoginRequest request) {
		// 1. user_id로 유저 조회
		User user = userRepository.findByUserId(request.getUserId())
			.orElseThrow(() -> new CustomAuthException(AuthErrorCode.USER_NOT_FOUND));
		// 2. 비밀번호 검증
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new CustomAuthException(AuthErrorCode.PASSWORD_MISMATCH);
		}

		// 3. accessToken 및 refreshToken 발급
		String accessToken = tokenService.generateToken(user.getId(), TokenType.ACCESS_TOKEN)
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.TOKEN_GENERATION_FAILED));

		TokenService.TokenWithExpiration refreshTokenWithExpiration =
			tokenService.generateTokenWithExpiration(user.getId(), TokenType.REFRESH_TOKEN)
				.orElseThrow(() -> new CustomTokenException(TokenErrorCode.TOKEN_GENERATION_FAILED));

		// 기존 Refresh Token이 있는지 확인
		RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId()).orElse(null);

		if (refreshToken != null) {
			log.info("해당 유저 고유 번호의 리프레시 토큰이 존재함");
			// 기존 객체의 토큰 값을 변경하고 업데이트
			refreshToken.setToken(refreshTokenWithExpiration.getToken());
			refreshToken.setExpiryDate(
				refreshTokenWithExpiration.getExpiration()
					.toInstant()
					.atZone(ZoneId.systemDefault())
					.toLocalDateTime());
		} else {
			log.info("해당 유저 고유 번호의 리프레시 토큰이 존재하지 않음");
			// 5. refreshToken DB 저장
			try {
				refreshToken = new RefreshToken();
				refreshToken.setUser(user);
				refreshToken.setToken(refreshTokenWithExpiration.getToken());
				refreshToken.setExpiryDate(
					refreshTokenWithExpiration.getExpiration().toInstant()
						.atZone(ZoneId.systemDefault()).toLocalDateTime());
				refreshTokenRepository.save(refreshToken);
			} catch (Exception e) {
				throw new CustomException(ErrorCode.DATABASE_ERROR, "Refresh Token DB 저장 에러 "+e.getMessage());
			}
		}
		return LoginResponse.of(accessToken, refreshTokenWithExpiration.getToken());
	}

	/**
	 * Access Token 및 Refresh Token 재발급
	 */
	@Transactional
	@Override
	public TokenRefreshResponse tokenRefresh(String refreshToken) {
		// 1. refreshToken이 null인지 검사
		if (refreshToken == null || refreshToken.trim().isEmpty()) {
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_NOT_EXIST);
		}
		// 2. refreshToken으로 user ID 추출
		Long id = tokenService.extractUserIdFromToken(refreshToken)
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.INVALID_REFRESH_TOKEN_ID));

		// 3. DB에서 refreshToken 조회
		RefreshToken dbRefreshToken = refreshTokenRepository.findByUserId(id)
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_NOT_FOUND));

		// 4. DB의 refreshToken과 비교
		if (!refreshToken.equals(dbRefreshToken.getToken())) {
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_MISMATCH);
		}

		// 5. 받은 refreshToken이 만료된 것인지 확인
		if (!tokenService.validateToken(refreshToken)) {
			refreshTokenRepository.delete(dbRefreshToken);
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_EXPIRED);
		}

		// 6. 새로운 accessToken 및 refreshToken 생성
		String newAccessToken = tokenService.generateToken(id, TokenType.ACCESS_TOKEN)
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.TOKEN_GENERATION_FAILED));

		TokenService.TokenWithExpiration newRefreshTokenWithExpiration =
			tokenService.generateTokenWithExpiration(id, TokenType.REFRESH_TOKEN)
				.orElseThrow(() -> new CustomTokenException(TokenErrorCode.TOKEN_GENERATION_FAILED));

		// 7. 기존의 refreshToken 교체
		dbRefreshToken.setToken(newRefreshTokenWithExpiration.getToken());
		dbRefreshToken.setExpiryDate(
			newRefreshTokenWithExpiration.getExpiration().toInstant()
				.atZone(ZoneId.systemDefault()).toLocalDateTime());

		return TokenRefreshResponse.of(newAccessToken, newRefreshTokenWithExpiration.getToken());
	}

	/**
	 * 로그아웃 처리 (블랙리스트 등록)
	 */
	@Transactional
	@Override
	public void logout(String refreshToken, HttpServletRequest httpServletRequest) {
		// 1. Refresh Token이 null인지 검사
		if (refreshToken == null || refreshToken.trim().isEmpty()) {
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_NOT_FOUND);
		}

		// 2. Access Token 추출
		String accessToken = tokenService.extractAccessToken(httpServletRequest);
		if (accessToken == null || accessToken.trim().isEmpty()) {
			throw new CustomTokenException(TokenErrorCode.ACCESS_TOKEN_NOT_EXIST);
		}

		// 3. Access Token 검증
		if (!tokenService.validateToken(accessToken)) {
			throw new CustomTokenException(TokenErrorCode.ACCESS_TOKEN_EXPIRED);
		}

		// 4. id 추출
		Long id = tokenService.extractUserIdFromToken(accessToken)
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN));

		// 5. DB에서 Refresh Token 확인 후 삭제
		RefreshToken dbRefreshToken = refreshTokenRepository.findByUserId(id)
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_NOT_FOUND));

		if (!refreshToken.equals(dbRefreshToken.getToken())) {
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_MISMATCH);
		}

		// 6. User 엔티티에서 RefreshToken을 null로 설정 (orphanRemoval = true 적용됨)
		userRepository.findById(id).ifPresent(user -> {
			user.setRefreshToken(null);
			userRepository.save(user);
		});

		refreshTokenRepository.delete(dbRefreshToken);
		refreshTokenRepository.flush();

		// 7. Access Token 블랙리스트 등록
		tokenService.addToBlacklist(accessToken);

	}

	@Override
	public List<UserIdResponseDto> findUserIdsByEmail(FindUserIdRequest request) {
		// 1. 이메일 유효성 검사
		if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
			throw new CustomAuthException(AuthErrorCode.INVALID_EMAIL);
		}

		// 2. 이메일로 사용자 조회
		List<User> users = userRepository.findByEmail(request.getEmail());

		// 3. 사용자가 존재하지 않는 경우 예외 발생
		if (users.isEmpty()) {
			throw new CustomAuthException(AuthErrorCode.USER_NOT_FOUND);
		}

		return users.stream()
			.map(user -> new UserIdResponseDto(
				user.getUserId(),
				user.getCreatedAt(),
				user.getProvider()
			))
			.collect(Collectors.toList());
	}


	@Override
	public void validateToken(HttpServletRequest request) {
		// 1. Access Token 추출
		String token = tokenService.extractAccessToken(request);
		if (token == null || token.trim().isEmpty()) {
			throw new CustomTokenException(TokenErrorCode.ACCESS_TOKEN_NOT_EXIST);
		}
		// 2. JWT 검증
		if (!tokenService.validateToken(token)) {
			throw new CustomTokenException(TokenErrorCode.INVALID_ACCESS_TOKEN);
		}
	}

	@Transactional
	@Override
	public void sendPasswordResetLink(ForgotPasswordRequest request) {
		// 1. 입력값 유효성 검사
		if (request.getUserId() == null || request.getUserId().isBlank()) {
			throw new CustomAuthException(AuthErrorCode.INVALID_USER_ID);
		}
		if (request.getEmail() == null || request.getEmail().isBlank()) {
			throw new CustomAuthException(AuthErrorCode.INVALID_EMAIL);
		}

		// 2. 사용자 조회
		User user = userRepository.findByUserIdAndEmail(request.getUserId(), request.getEmail())
			.orElseThrow(() -> new CustomAuthException(AuthErrorCode.USER_NOT_FOUND));

		// 3. 기존 토큰 삭제
		if (user.getPasswordResetToken() != null) {
			passwordResetTokenRepository.delete(user.getPasswordResetToken());
			passwordResetTokenRepository.flush(); // 즉시 반영
			user.setPasswordResetToken(null); // Hibernate가 변경을 인식할 수 있도록 설정
		}

		// 4. 새로운 비밀번호 변경 토큰 생성 및 저장
		PasswordResetToken passwordResetToken = new PasswordResetToken(user);
		user.setPasswordResetToken(passwordResetToken);
		passwordResetTokenRepository.save(passwordResetToken);

		// 5. 비밀번호 변경 링크 생성
		String resetLink = passwordResetBaseUrl + "?token=" + passwordResetToken.getToken();

		// 6. 이메일로 링크 전송
		String subject = "비밀번호 재설정 안내";
		String message = String.format(
			"안녕하세요, %s님\n\n비밀번호를 변경하려면 아래 링크를 클릭하세요:\n%s\n\n이 링크는 1시간 후 만료됩니다.",
			user.getUsername(), resetLink
		);

		emailService.sendEmail(user.getEmail(), subject, message);
	}

	@Transactional
	@Override
	public void resetPassword(PasswordResetRequest request) {
		// 1. 입력값 검증
		if (request.getToken() == null || request.getToken().trim().isEmpty()) {
			throw new CustomTokenException(TokenErrorCode.PASSWORD_TOKEN_NOT_FOUND);
		}
		if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
			throw new CustomAuthException(AuthErrorCode.WEAK_PASSWORD);
		}

		// 2. 토큰으로 PasswordResetToken 조회
		PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.PASSWORD_TOKEN_NOT_FOUND));

		// 3. 토큰 만료 여부 확인
		if (resetToken.isExpired()) {
			passwordResetTokenRepository.delete(resetToken); // 만료된 토큰 삭제
			throw new CustomTokenException(TokenErrorCode.PASSWORD_TOKEN_EXPIRED);
		}

		// 4. 해당 사용자의 비밀번호 변경
		User user = resetToken.getUser();
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));

		// 5. 사용된 토큰 삭제 (고아 객체 탈락)
		user.setPasswordResetToken(null);
	}

	/**
	 * 이메일 유효성 검증 (단순 정규식 검증)
	 */
	private boolean isValidEmail(String email) {
		String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
		return email != null && email.matches(emailRegex);
	}
}
