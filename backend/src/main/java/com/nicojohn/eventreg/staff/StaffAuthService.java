package com.nicojohn.eventreg.staff;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.security.JwtService;
import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.staff.dto.LoginRequest;
import com.nicojohn.eventreg.staff.dto.LoginResponse;
import com.nicojohn.eventreg.staff.dto.StaffProfileResponse;

@Service
public class StaffAuthService {

    private static final String INVALID_CREDENTIALS = "Invalid username or password.";

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public StaffAuthService(
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        StaffUser user = staffRepository.findByUsernameIgnoreCase(request.username())
                .orElseThrow(() -> ApiException.unauthorized(INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized(INVALID_CREDENTIALS);
        }

        JwtService.IssuedToken issued = jwtService.issueToken(user);
        return new LoginResponse(issued.token(), issued.expiresAt(), StaffProfileResponse.from(user));
    }

    @Transactional(readOnly = true)
    public StaffProfileResponse me(StaffPrincipal principal) {
        if (principal == null) {
            throw ApiException.unauthorized("Authentication required.");
        }
        StaffUser user = staffRepository.findById(principal.id())
                .orElseThrow(() -> ApiException.unauthorized("Session is no longer valid."));
        return StaffProfileResponse.from(user);
    }
}
