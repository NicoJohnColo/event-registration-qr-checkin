package com.nicojohn.eventreg.common.security;

import com.nicojohn.eventreg.staff.Role;

/** Authenticated staff identity stored in Spring SecurityContext after JWT verification. */
public record StaffPrincipal(Long id, String username, String name, Role role) {
}
