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
		// userId 중복 검사
		if (userRepository.findByUserId(request.getUserId()).isPresent()) {
			throw new CustomException(ErrorCode.USER_ID_DUPLICATE);
		}

		// email 중복 검사
		// if (userRepository.findByEmail(request.getEmail()).isPresent()) {
		// 	throw new DuplicateEmailException();
		// }
		//비밀번호 암호화 후 저장
		User user = new User();
		user.setUserId(request.getUserId());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setEmail(request.getEmail());
		user.setUsername(request.getUsername());
		user.setProvider("LOCAL");
		user.setProviderId(null);
		userRepository.save(user);
	}

	/**
	 * 아이디 중복 검사
	 */
	@Override
	public CheckUserIdResponse checkUserId(String userId) {
		boolean exists = userRepository.findByUserId(userId).isPresent();
		if (exists) {
			return CheckUserIdResponse.of("User Id already exists.", 200, userId, true);
		} else {
			return CheckUserIdResponse.of("User Id not exists.", 200, userId, false);
		}
	}

	// /**
	//  * 이메일 중복 검사 (Unique에서 변경돼서 쓸 일 아직 없음)
	//  */
	// @Override
	// public CheckEmailResponse checkEmail(String email) {
	// 	boolean exists = userRepository.findByEmail(email).isPresent();
	// 	if (exists) {
	// 		return CheckEmailResponse.of("Email already exists.", 200, email, true);
	// 	} else {
	// 		return CheckEmailResponse.of("Email not exists.", 200, email, false);
	// 	}
	// }

	/**
	 * 로그인 (Access Token, Refresh Token 발급)
	 */
	@Transactional
	@Override
	public LoginResponse login(LoginRequest request) {
		//user_id로 유저 조회
		User user = userRepository.findByUserId(request.getUserId())
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		//비밀번호 검증
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
		}

		//accessToken 및 refreshToken 발급
		String accessToken = tokenService.generateToken(user.getId(), TokenType.ACCESS_TOKEN);
		TokenService.TokenWithExpiration refreshTokenWithExpiration = tokenService.generateTokenWithExpiration(
			user.getId(), TokenType.REFRESH_TOKEN);

		// 기존 Refresh Token이 있는지 확인
		RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId()).orElse(null);

		if (refreshToken != null) {
			// 기존 객체의 토큰 값을 변경하고 업데이트
			refreshToken.setToken(refreshTokenWithExpiration.getToken());
			refreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration()
				.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDateTime());
		} else {
			//refreshToken DB 저장
			refreshToken = new RefreshToken();
			refreshToken.setUser(user);
			refreshToken.setToken(refreshTokenWithExpiration.getToken());
			refreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration()
				.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDateTime());
			refreshTokenRepository.save(refreshToken);
		}
		return LoginResponse.of(accessToken, refreshTokenWithExpiration.getToken());
	}

	/**
	 * Access Token 및 Refresh Token 재발급
	 */
	@Transactional
	@Override
	public TokenRefreshResponse tokenRefresh(String refreshToken) {
		//refreshToken 으로 user 고유번호 추출
		long id;
		try {
			id = tokenService.extractUserIdFromToken(refreshToken);
		} catch (Exception e) {
			throw new CustomTokenException(TokenErrorCode.INVALID_REFRESH_TOKEN_ID,e.getMessage());
		}
		//DB에 refreshToken이 있는지 확인
		RefreshToken dbRefreshToken = refreshTokenRepository.findByUserId(id)
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_NOT_FOUND));

		//DB의 refreshToken과 비교
		if (!refreshToken.equals(dbRefreshToken.getToken())) {
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_MISMATCH);
		}
		//받은 refreshToken이 만료된 것인지 확인
		if (!tokenService.validateToken(refreshToken)) {
			refreshTokenRepository.delete(dbRefreshToken);
			throw new CustomTokenException(TokenErrorCode.REFRESH_TOKEN_EXPIRED);
		}

		//새로운 token 생성
		String newAccessToken = tokenService.generateToken(id, TokenType.ACCESS_TOKEN);
		TokenService.TokenWithExpiration newRefreshTokenWithExpiration =
			tokenService.generateTokenWithExpiration(id, TokenType.REFRESH_TOKEN);

		//기존의 refreshToken 교체
		dbRefreshToken.setToken(newRefreshTokenWithExpiration.getToken());
		dbRefreshToken.setExpiryDate(
			newRefreshTokenWithExpiration.getExpiration().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());

		return TokenRefreshResponse.of(newAccessToken, newRefreshTokenWithExpiration.getToken());
	}

	/**
	 * 로그아웃 처리 (블랙리스트 등록)
	 */
	@Transactional
	@Override
	public void logout(HttpServletRequest httpServletRequest) {
		//Access Token 추출
		String accessToken = tokenService.extractAccessToken(httpServletRequest);
		//Access Token 만료 여부 확인
		if (!tokenService.validateToken(accessToken)) {
			throw new IllegalArgumentException("Access Token is already expired.");
		}
		//id 추출
		Long id = tokenService.extractUserIdFromToken(accessToken);

		// ✅ 1. User 엔티티에서 RefreshToken을 null로 설정 (orphanRemoval = true 적용됨)
		userRepository.findById(id).ifPresent(user -> {
			user.setRefreshToken(null);
			userRepository.save(user);
		});
		// ✅ 2. RefreshToken 삭제
		refreshTokenRepository.deleteByUserId(id);
		refreshTokenRepository.flush(); // 즉시 반영

		//Access Token 블랙리스트 등록
		tokenService.addToBlacklist(accessToken);
	}

	@Override
	public List<UserIdResponseDto> findUserIdsByEmail(FindUserIdRequest request) {
		List<User> users = userRepository.findByEmail(request.getEmail());

		return users.stream()
			.map(user -> new UserIdResponseDto(
				user.getUserId(),
				user.getCreatedAt(),
				user.getProvider()
			))
			.collect(Collectors.toList());
	}

	@Override
	public void resetPassword(PasswordResetRequest request) {
		// 1. 토큰으로 PasswordResetToken 조회
		PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
			.orElseThrow(() -> new CustomTokenException(TokenErrorCode.PASSWORD_TOKEN_NOT_FOUND));

		// 2. 토큰 만료 여부 확인
		if (resetToken.isExpired()) {
			passwordResetTokenRepository.delete(resetToken); // 만료된 토큰 삭제
			throw new CustomTokenException(TokenErrorCode.PASSWORD_TOKEN_EXPIRED);
		}

		// 3. 해당 사용자의 비밀번호 변경
		User user = resetToken.getUser();
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);

		// 4. 사용된 토큰 삭제 (보안 강화를 위해)
		passwordResetTokenRepository.delete(resetToken);
	}

	@Override
	public void sendPasswordResetLink(ForgotPasswordRequest request) {
		User user = userRepository.findByUserIdAndEmail(request.getUserId(), request.getEmail())
			.orElseThrow(()-> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 1. 기존 토큰 삭제 (보안 강화)
		passwordResetTokenRepository.findByUserId(user.getId())
			.ifPresent(passwordResetTokenRepository::delete);

		// 2. 비밀번호 변경 토큰 생성 및 저장
		PasswordResetToken resetToken = new PasswordResetToken(user);
		passwordResetTokenRepository.save(resetToken);

		// 3. 비밀번호 변경 링크 생성 (yml에서 설정 값 불러오기)
		String resetLink = passwordResetBaseUrl + "?token=" + resetToken.getToken();

		// 4. 이메일로 링크 전송
		String subject = "비밀번호 재설정 안내";
		String message = String.format(
			"안녕하세요, %s님\n\n비밀번호를 변경하려면 아래 링크를 클릭하세요:\n%s\n\n이 링크는 1시간 후 만료됩니다.",
			user.getUsername(), resetLink
		);

		emailService.sendEmail(user.getEmail(), subject, message);
	}
}
