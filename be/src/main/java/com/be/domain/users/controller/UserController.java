package com.be.domain.users.controller;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<? extends BaseResponseBody> getCurrentUser() {
        //사용자 정보 조회
        return null;
    }

    @PatchMapping("/me")
    public ResponseEntity<? extends BaseResponseBody> updateUser(@RequestBody UserUpdateRequest request) {
        //사용자 정보 수정
        return null;
    }
    
    @PatchMapping("/me/password")
    public ResponseEntity<? extends BaseResponseBody> updatePassword(@RequestBody PasswordUpdateRequest request) {
        //사용자 비밀번호 변경
        return null;
    }

    @DeleteMapping("/me")
    public ResponseEntity<? extends BaseResponseBody> deleteUser(@RequestBody PasswordRequest request) {
        //회원 탈퇴
        return null;
    }
}
