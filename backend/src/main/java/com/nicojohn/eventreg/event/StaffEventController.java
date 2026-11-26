package com.nicojohn.eventreg.event;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.event.dto.EventUpsertRequest;
import com.nicojohn.eventreg.event.dto.StaffEventResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/staff/events")
@PreAuthorize("hasRole('ORGANIZER')")
public class StaffEventController {

    private final EventService eventService;

    public StaffEventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<StaffEventResponse> listEvents() {
        return eventService.listAllEventsForStaff();
    }

    @GetMapping("/{id}")
    public StaffEventResponse getEvent(@PathVariable Long id) {
        return eventService.getEventForStaff(id);
    }

    @PostMapping
    public StaffEventResponse createEvent(
            @Valid @RequestBody EventUpsertRequest request,
            @AuthenticationPrincipal StaffPrincipal principal) {
        return eventService.createEvent(request, principal != null ? principal.id() : null);
    }

    @PutMapping("/{id}")
    public StaffEventResponse updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventUpsertRequest request,
            @AuthenticationPrincipal StaffPrincipal principal) {
        return eventService.updateEvent(id, request, principal != null ? principal.id() : null);
    }

    @PostMapping("/{id}/close")
    public StaffEventResponse closeEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal StaffPrincipal principal) {
        return eventService.closeEvent(id, principal != null ? principal.id() : null);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal StaffPrincipal principal) {
        eventService.deleteEvent(id, principal != null ? principal.id() : null);
    }
}
