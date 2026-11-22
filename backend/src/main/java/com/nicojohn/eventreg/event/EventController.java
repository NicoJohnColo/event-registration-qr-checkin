package com.nicojohn.eventreg.event;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.event.dto.EventResponse;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> listPublished() {
        return eventService.listPublishedEvents();
    }

    @GetMapping("/{id}")
    public EventResponse getPublished(@PathVariable Long id) {
        return eventService.getPublishedEvent(id);
    }
}
