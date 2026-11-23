package com.nicojohn.eventreg.registration;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.registration.dto.AttendeeListResponse;

@RestController
@RequestMapping("/api/staff/events/{eventId}/attendees")
public class StaffAttendeeController {

    private final RegistrationService registrationService;

    public StaffAttendeeController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping
    public AttendeeListResponse list(
            @PathVariable Long eventId,
            @RequestParam(name = "q", required = false) String q) {
        return registrationService.listAttendeesForEvent(eventId, q);
    }
}
