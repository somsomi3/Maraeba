package com.be.common.exception;

public class AccessTokenException extends RuntimeException {
  public AccessTokenException(String message) {
    super(message);
  }
  public AccessTokenException() {super("access_token not found in the response from Kakao");}
}
