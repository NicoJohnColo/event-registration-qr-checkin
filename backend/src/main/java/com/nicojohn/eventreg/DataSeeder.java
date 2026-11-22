package com.nicojohn.eventreg;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.event.EventStatus;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationStatus;
import com.nicojohn.eventreg.registration.TicketCodeGenerator;

/**
 * Seeds Level 1 demo events (S1-S4 from the Test Data plan) with dates relative to
 * today in Asia/Manila so the event-day check-in test always works out of the box.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TicketCodeGenerator ticketCodeGenerator;
    private final Clock clock;

    public DataSeeder(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            TicketCodeGenerator ticketCodeGenerator,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.ticketCodeGenerator = ticketCodeGenerator;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (eventRepository.count() > 0) {
            return;
        }

        LocalDate today = LocalDate.now(clock.withZone(ManilaTime.ZONE));
        Instant now = Instant.now(clock);

        // S1 (required): Today 8:00 AM - 10:00 PM, cap 30, 3 confirmed -> 27 of 30 spots left
        Event s1 = eventRepository.save(new Event(
                "Cebu Dev Meetup 2026",
                "Monthly gathering for Cebu software engineers, students, and builders. Talks, lightning demos, and networking.",
                "Ayala Center Cebu, Function Room 2",
                ManilaTime.atManilaTime(today, 8, 0),
                ManilaTime.atManilaTime(today, 22, 0),
                30,
                EventStatus.PUBLISHED,
                "CDM",
                now));

        // S2 (required): Today + 7 days, 1:00 PM - 5:00 PM, cap 50, 0 registrations
        eventRepository.save(new Event(
                "Cebu Web Design Workshop",
                "Hands-on UI layout, typography, and responsive mobile design session for web developers.",
                "IT Park, Lahug, Cebu City",
                ManilaTime.atManilaTime(today.plusDays(7), 13, 0),
                ManilaTime.atManilaTime(today.plusDays(7), 17, 0),
                50,
                EventStatus.PUBLISHED,
                "CWD",
                now));

        // S3 (required): Today + 3 days, 6:00 PM - 9:00 PM, cap 5, 5 confirmed (FULL)
        Event s3 = eventRepository.save(new Event(
                "Cebu Startup Pitch Night",
                "Early-stage founders from Cebu pitch their products in 5-minute lightning rounds.",
                "Cebu Business Park",
                ManilaTime.atManilaTime(today.plusDays(3), 18, 0),
                ManilaTime.atManilaTime(today.plusDays(3), 21, 0),
                5,
                EventStatus.PUBLISHED,
                "CSP",
                now));

        // S4: Today - 7 days, 9:00 AM - 3:00 PM, cap 40, 2 confirmed (past event)
        Event s4 = eventRepository.save(new Event(
                "Cebu Code Camp",
                "Full-day coding bootcamp and collaborative build sprint.",
                "USC Talamban",
                ManilaTime.atManilaTime(today.minusDays(7), 9, 0),
                ManilaTime.atManilaTime(today.minusDays(7), 15, 0),
                40,
                EventStatus.PUBLISHED,
                "CCC",
                now.minusSeconds(7 * 86400L)));

        // Seed 3 confirmed attendees for S1 (leaving Test Data emails juan/maria/pedro free)
        seedConfirmed(s1, now, List.of(
                new SeedAttendee("Ana Reyes", "ana.reyes@example.com", "09171000001"),
                new SeedAttendee("Marco Lim", "marco.lim@example.com", "09171000002"),
                new SeedAttendee("Sofia Tan", "sofia.tan@example.com", "09171000003")
        ));

        // Seed 5 confirmed attendees for S3 so it starts FULL
        seedConfirmed(s3, now, List.of(
                new SeedAttendee("Carlos Bautista", "carlos.bautista@example.com", "09181000001"),
                new SeedAttendee("Elena Navarro", "elena.navarro@example.com", "09181000002"),
                new SeedAttendee("Rafael Aquino", "rafael.aquino@example.com", "09181000003"),
                new SeedAttendee("Bianca Ramos", "bianca.ramos@example.com", "09181000004"),
                new SeedAttendee("Diego Mendoza", "diego.mendoza@example.com", "09181000005")
        ));

        // Seed 2 confirmed attendees for S4 (past)
        seedConfirmed(s4, now.minusSeconds(7 * 86400L), List.of(
                new SeedAttendee("Liza Torres", "liza.torres@example.com", "09191000001"),
                new SeedAttendee("Paolo Garcia", "paolo.garcia@example.com", "09191000002")
        ));

        log.info("Seeded Level 1 events (S1-S4) relative to Cebu date {}", today);
    }

    private void seedConfirmed(Event event, Instant registeredAt, List<SeedAttendee> attendees) {
        for (SeedAttendee attendee : attendees) {
            String code;
            do {
                code = ticketCodeGenerator.generate(event.getCodePrefix());
            } while (registrationRepository.existsByTicketCode(code));

            registrationRepository.save(new Registration(
                    event,
                    attendee.fullName(),
                    attendee.email(),
                    attendee.mobile(),
                    code,
                    RegistrationStatus.CONFIRMED,
                    registeredAt));
        }
    }

    private record SeedAttendee(String fullName, String email, String mobile) {}
}
