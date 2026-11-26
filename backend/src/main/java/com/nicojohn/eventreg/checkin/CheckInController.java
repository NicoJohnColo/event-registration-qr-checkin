package com.nicojohn.eventreg.checkin;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.checkin.dto.CheckInRequest;
import com.nicojohn.eventreg.checkin.dto.CheckInResponse;
import com.nicojohn.eventreg.checkin.dto.CheckInStatsResponse;
import com.nicojohn.eventreg.common.security.StaffPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/checkin")
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @PostMapping
    public CheckInResponse checkIn(
            @Valid @RequestBody CheckInRequest request,
            @AuthenticationPrincipal StaffPrincipal principal) {
        return checkInService.checkIn(request, principal);
    }

    @PostMapping("/events/{eventId}/undo")
    public CheckInResponse undoCheckIn(
            @PathVariable Long eventId,
            @RequestParam String ticketCode,
            @AuthenticationPrincipal StaffPrincipal principal) {
        return checkInService.undoCheckIn(eventId, ticketCode, principal);
    }

    @GetMapping("/stats")
    public CheckInStatsResponse stats(@RequestParam Long eventId) {
        return checkInService.getStats(eventId);
    }
}
