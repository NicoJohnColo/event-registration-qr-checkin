package com.nicojohn.eventreg.registration;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Properties;

import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import com.nicojohn.eventreg.common.util.QrImageGenerator;
import com.nicojohn.eventreg.registration.dto.TicketResponse;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

class TicketEmailServiceTest {

    private TicketResponse sampleTicket(RegistrationStatus status, Integer waitlistPos) {
        return new TicketResponse(
                10L,
                "CDM-7K3P9Q",
                "ER1.CDM-7K3P9Q.ABCDEF123456ABCDEF123456",
                status,
                waitlistPos,
                "Juan Peña",
                "juan@example.com",
                "09171234567",
                Instant.parse("2026-11-26T02:00:00Z"),
                null,
                1L,
                "Cebu Dev Meetup 2026",
                "Ayala Center Cebu",
                Instant.parse("2026-11-26T00:00:00Z"),
                Instant.parse("2026-11-26T15:59:00Z")
        );
    }

    @Test
    void generatesValidPngQrCodeBytes() {
        byte[] png = QrImageGenerator.toPngBytes("ER1.CDM-7K3P9Q.ABCDEF123456ABCDEF123456");
        assertTrue(png.length > 100);
        // PNG magic signature: 89 50 4E 47
        assertEquals((byte) 0x89, png[0]);
        assertEquals((byte) 'P', png[1]);
        assertEquals((byte) 'N', png[2]);
        assertEquals((byte) 'G', png[3]);
    }

    @Test
    void logsDryRunSafelyWithoutCallingMailSenderWhenDisabled() {
        JavaMailSender sender = mock(JavaMailSender.class);
        TicketEmailService service = new TicketEmailService(
                sender, false, "no-reply@eventregister.local", "http://localhost:5173/");

        assertDoesNotThrow(() -> service.sendRegistrationEmail(sampleTicket(RegistrationStatus.CONFIRMED, null)));
        assertDoesNotThrow(() -> service.sendPromotionEmail(sampleTicket(RegistrationStatus.CONFIRMED, null)));
        verifyNoInteractions(sender);
    }

    @Test
    void sendsHtmlPassWithInlineQrForConfirmedAndPromotedAndOmitsQrForWaitlisted() throws Exception {
        JavaMailSender sender = mock(JavaMailSender.class);
        Session session = Session.getInstance(new Properties());
        MimeMessage confirmedMsg = new MimeMessage(session);
        MimeMessage waitlistedMsg = new MimeMessage(session);
        MimeMessage promotedMsg = new MimeMessage(session);

        when(sender.createMimeMessage()).thenReturn(confirmedMsg, waitlistedMsg, promotedMsg);

        TicketEmailService service = new TicketEmailService(
                sender, true, "no-reply@eventregister.cebu", "https://cebu.example.com");

        service.sendRegistrationEmail(sampleTicket(RegistrationStatus.CONFIRMED, null));
        service.sendRegistrationEmail(sampleTicket(RegistrationStatus.WAITLISTED, 2));
        service.sendPromotionEmail(sampleTicket(RegistrationStatus.CONFIRMED, null));

        verify(sender).send(confirmedMsg);
        verify(sender).send(waitlistedMsg);
        verify(sender).send(promotedMsg);

        assertTrue(confirmedMsg.getSubject().contains("Confirmed QR Pass"));
        assertTrue(waitlistedMsg.getSubject().contains("Waitlist #2"));
        assertTrue(promotedMsg.getSubject().contains("Promoted & Confirmed"));

        String confirmedHtml = service.buildEmailHtml(
                sampleTicket(RegistrationStatus.CONFIRMED, null),
                "CONFIRMED", "#1951FC", "Confirmed", "Intro", true);
        String waitlistedHtml = service.buildEmailHtml(
                sampleTicket(RegistrationStatus.WAITLISTED, 2),
                "WAITLISTED", "#D97706", "Waitlist", "Intro", false);

        assertTrue(confirmedHtml.contains("cid:ticketQr"));
        assertTrue(confirmedHtml.contains("https://cebu.example.com/ticket/CDM-7K3P9Q"));
        assertFalse(waitlistedHtml.contains("cid:ticketQr"));
    }
}
