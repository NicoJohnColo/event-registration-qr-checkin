package com.nicojohn.eventreg.staff.dto;

import com.nicojohn.eventreg.staff.Role;
import com.nicojohn.eventreg.staff.StaffUser;

/** Safe staff profile DTO — never exposes passwordHash. */
public record StaffProfileResponse(
        Long id,
        String name,
        String username,
        Role role) {

    public static StaffProfileResponse from(StaffUser user) {
        return new StaffProfileResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getRole());
    }
}
