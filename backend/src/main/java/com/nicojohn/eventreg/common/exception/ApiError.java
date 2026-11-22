package com.nicojohn.eventreg.common.exception;

import java.time.Instant;
import java.util.Map;

/**
 * Standard JSON error envelope returned by all endpoints.
 * {@code fieldErrors} is populated only for bean-validation failures.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors) {

    public static ApiError of(int status, String error, String message) {
        return new ApiError(Instant.now(), status, error, message, null);
    }

    public static ApiError withFields(int status, String error, String message, Map<String, String> fieldErrors) {
        return new ApiError(Instant.now(), status, error, message, fieldErrors);
    }
}
