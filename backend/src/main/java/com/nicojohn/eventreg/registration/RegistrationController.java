package com.nicojohn.eventreg.registration;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.registration.dto.RegisterRequest;
import com.nicojohn.eventreg.registration.dto.TicketResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events/{eventId}/register")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> register(
            @PathVariable Long eventId,
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.register(eventId, request));
    }
}
