package com.nicojohn.eventreg.registration;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.registration.dto.TicketLookupRequest;
import com.nicojohn.eventreg.registration.dto.TicketResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketLookupController {

    private final RegistrationService registrationService;

    public TicketLookupController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/lookup")
    public TicketResponse lookup(@Valid @RequestBody TicketLookupRequest request) {
        return registrationService.lookupTicket(request);
    }

    @PostMapping("/cancel")
    public TicketResponse cancel(@Valid @RequestBody TicketLookupRequest request) {
        return registrationService.attendeeCancel(request);
    }
}
