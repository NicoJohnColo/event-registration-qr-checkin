package com.nicojohn.eventreg.staff.dto;

import java.time.Instant;

/** Response returned on successful staff authentication. */
public record LoginResponse(
        String token,
        Instant expiresAt,
        StaffProfileResponse staff) {
}
