package com.nicojohn.eventreg.staff;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.staff.dto.LoginRequest;
import com.nicojohn.eventreg.staff.dto.LoginResponse;
import com.nicojohn.eventreg.staff.dto.StaffProfileResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final StaffAuthService staffAuthService;

    public AuthController(StaffAuthService staffAuthService) {
        this.staffAuthService = staffAuthService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return staffAuthService.login(request);
    }

    @GetMapping("/me")
    public StaffProfileResponse me(@AuthenticationPrincipal StaffPrincipal principal) {
        return staffAuthService.me(principal);
    }
}
