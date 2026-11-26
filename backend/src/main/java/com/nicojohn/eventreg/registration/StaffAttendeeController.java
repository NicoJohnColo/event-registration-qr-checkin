package com.nicojohn.eventreg.registration;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.registration.dto.AttendeeListResponse;
import com.nicojohn.eventreg.registration.dto.TicketResponse;

@RestController
@RequestMapping("/api/staff")
public class StaffAttendeeController {

    private final RegistrationService registrationService;

    public StaffAttendeeController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping("/events/{eventId}/attendees")
    public AttendeeListResponse list(
            @PathVariable Long eventId,
            @RequestParam(name = "q", required = false) String q) {
        return registrationService.listAttendeesForEvent(eventId, q);
    }

    @PostMapping("/events/{eventId}/promote-waitlist")
    @PreAuthorize("hasRole('ORGANIZER')")
    public TicketResponse promoteFirstWaitlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal StaffPrincipal principal) {
        return registrationService.promoteFirstWaitlist(eventId, principal != null ? principal.id() : null);
    }

    @PostMapping("/registrations/{id}/cancel")
    @PreAuthorize("hasRole('ORGANIZER')")
    public TicketResponse staffCancel(
            @PathVariable Long id,
            @AuthenticationPrincipal StaffPrincipal principal) {
        return registrationService.staffCancel(id, principal != null ? principal.id() : null);
    }
}
