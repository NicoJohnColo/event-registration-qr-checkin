package com.nicojohn.eventreg.registration;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.common.util.QrImageGenerator;
import com.nicojohn.eventreg.registration.dto.TicketResponse;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Non-blocking email notifier for registration confirmations, waitlist placement,
 * and organizer waitlist promotions. Uses SMTP sandbox settings from `.env` when
 * {@code app.mail.enabled=true}, otherwise safely logs dry-run previews locally.
 */
@Service
public class TicketEmailService {

    private static final Logger log = LoggerFactory.getLogger(TicketEmailService.class);

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String fromAddress;
    private final String publicBaseUrl;

    @Autowired
    public TicketEmailService(
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${app.mail.host:}") String host,
            @Value("${app.mail.port:2525}") int port,
            @Value("${app.mail.username:}") String username,
            @Value("${app.mail.password:}") String password,
            @Value("${app.mail.from:no-reply@eventregister.local}") String fromAddress,
            @Value("${app.mail.smtp-auth:true}") boolean smtpAuth,
            @Value("${app.mail.starttls:true}") boolean starttls,
            @Value("${app.public-base-url:http://localhost:5173}") String publicBaseUrl) {
        this(
                buildMailSender(mailEnabled, host, port, username, password, smtpAuth, starttls),
                mailEnabled && host != null && !host.isBlank(),
                fromAddress,
                publicBaseUrl);
    }

    TicketEmailService(JavaMailSender mailSender, boolean mailEnabled, String fromAddress, String publicBaseUrl) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.fromAddress = fromAddress;
        this.publicBaseUrl = stripTrailingSlash(publicBaseUrl);
    }

    /** Asynchronously sends confirmation (with inline QR PNG) or waitlist queue notice. */
    @Async
    public void sendRegistrationEmail(TicketResponse ticket) {
        if (ticket == null) return;
        if (ticket.status() == RegistrationStatus.WAITLISTED) {
            String subject = "Waitlist #" + ticket.waitlistPosition() + ": " + ticket.eventTitle();
            String body = buildEmailHtml(
                    ticket,
                    "WAITLISTED",
                    "#D97706",
                    "You're #" + ticket.waitlistPosition() + " on the waitlist",
                    "All seats are currently reserved. Waitlisted passes cannot enter at the door yet — we'll email your active QR pass automatically if an organizer promotes you.",
                    false);
            deliver(ticket, subject, body, false);
            return;
        }

        String subject = "Confirmed QR Pass: " + ticket.eventTitle() + " (" + ticket.ticketCode() + ")";
        String body = buildEmailHtml(
                ticket,
                "CONFIRMED",
                "#1951FC",
                "Your seat is confirmed!",
                "Present the QR code below (or open your pass link) at the venue entrance in Cebu.",
                true);
        deliver(ticket, subject, body, true);
    }

    /** Asynchronously sends waitlist promotion confirmation with active QR pass. */
    @Async
    public void sendPromotionEmail(TicketResponse ticket) {
        if (ticket == null) return;
        String subject = "Promoted & Confirmed: " + ticket.eventTitle() + " (" + ticket.ticketCode() + ")";
        String body = buildEmailHtml(
                ticket,
                "PROMOTED · CONFIRMED",
                "#10B981",
                "Good news — a seat opened up!",
                "You have been promoted from the waitlist. Present the QR code below at the venue entrance.",
                true);
        deliver(ticket, subject, body, true);
    }

    private void deliver(TicketResponse ticket, String subject, String htmlBody, boolean attachQr) {
        String ticketUrl = buildTicketUrl(ticket.ticketCode());
        if (!mailEnabled || mailSender == null) {
            log.info(
                    "[EMAIL-SANDBOX-DRYRUN] to={} subject=\"{}\" status={} code={} passUrl={}",
                    ticket.email(),
                    subject,
                    ticket.status(),
                    ticket.ticketCode(),
                    ticketUrl);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, attachQr, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress);
            helper.setTo(ticket.email());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            if (attachQr) {
                String qrContent = (ticket.qrPayload() != null && !ticket.qrPayload().isBlank())
                        ? ticket.qrPayload()
                        : ticket.ticketCode();
                byte[] pngBytes = QrImageGenerator.toPngBytes(qrContent);
                helper.addInline("ticketQr", new ByteArrayResource(pngBytes), "image/png");
            }

            mailSender.send(message);
            log.info("Sent email \"{}\" to {}", subject, ticket.email());
        } catch (MessagingException | RuntimeException ex) {
            log.warn("Failed sending email \"{}\" to {}: {}", subject, ticket.email(), ex.getMessage());
        }
    }

    String buildEmailHtml(
            TicketResponse ticket,
            String badgeText,
            String accentColor,
            String heading,
            String intro,
            boolean includeQrBlock) {
        String dateLabel = HtmlUtils.htmlEscape(ManilaTime.formatDate(ticket.eventStartsAt()));
        String timeLabel = HtmlUtils.htmlEscape(
                ManilaTime.formatTime(ticket.eventStartsAt()) + " – " + ManilaTime.formatTime(ticket.eventEndsAt()));
        String title = HtmlUtils.htmlEscape(ticket.eventTitle());
        String venue = HtmlUtils.htmlEscape(ticket.eventVenue());
        String attendee = HtmlUtils.htmlEscape(ticket.attendeeName());
        String code = HtmlUtils.htmlEscape(ticket.ticketCode());
        String passUrl = HtmlUtils.htmlEscape(buildTicketUrl(ticket.ticketCode()));
        String lookupUrl = HtmlUtils.htmlEscape(publicBaseUrl + "/lookup");

        String qrSection = includeQrBlock
                ? "<div style=\"margin:20px 0;padding:16px;background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:12px;text-align:center;\">"
                        + "<img src=\"cid:ticketQr\" alt=\"QR Pass for " + code + "\" width=\"180\" height=\"180\" style=\"display:block;margin:0 auto 10px auto;\"/>"
                        + "<div style=\"font-family:monospace;font-size:18px;font-weight:700;letter-spacing:2px;color:#0F172A;\">" + code + "</div>"
                        + "</div>"
                : "<div style=\"margin:20px 0;padding:14px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;text-align:center;\">"
                        + "<div style=\"font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;\">Waitlist Reference Code</div>"
                        + "<div style=\"font-family:monospace;font-size:18px;font-weight:700;letter-spacing:2px;color:#0F172A;margin-top:4px;\">" + code + "</div>"
                        + "</div>";

        return "<!DOCTYPE html><html><body style=\"margin:0;padding:24px;background:#F1F5F9;font-family:Arial,sans-serif;color:#0F172A;\">"
                + "<div style=\"max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;\">"
                + "<div style=\"background:#03195B;padding:20px 24px;color:#FFFFFF;\">"
                + "<span style=\"display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;background:" + accentColor + ";color:#FFFFFF;\">" + HtmlUtils.htmlEscape(badgeText) + "</span>"
                + "<h1 style=\"margin:10px 0 4px 0;font-size:20px;\">" + title + "</h1>"
                + "<p style=\"margin:0;font-size:13px;color:#CBD5E1;\">EventRegister · Asia/Manila (UTC+8)</p>"
                + "</div>"
                + "<div style=\"padding:24px;\">"
                + "<p style=\"margin:0 0 8px 0;font-size:16px;font-weight:700;\">Hi " + attendee + ",</p>"
                + "<p style=\"margin:0 0 12px 0;font-size:14px;font-weight:700;color:" + accentColor + ";\">" + HtmlUtils.htmlEscape(heading) + "</p>"
                + "<p style=\"margin:0 0 18px 0;font-size:14px;line-height:1.5;color:#334155;\">" + HtmlUtils.htmlEscape(intro) + "</p>"
                + "<div style=\"background:#F8FAFC;border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.6;color:#1E293B;\">"
                + "<div><strong>Date:</strong> " + dateLabel + "</div>"
                + "<div><strong>Time:</strong> " + timeLabel + " (Cebu time)</div>"
                + "<div><strong>Venue:</strong> " + venue + "</div>"
                + "</div>"
                + qrSection
                + "<div style=\"text-align:center;margin-top:18px;\">"
                + "<a href=\"" + passUrl + "\" style=\"display:inline-block;background:#1951FC;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:10px;\">View Ticket Online</a>"
                + "</div>"
                + "<p style=\"margin:16px 0 0 0;font-size:12px;color:#64748B;text-align:center;\">"
                + "To verify or cancel later, visit <a href=\"" + lookupUrl + "\" style=\"color:#1951FC;\">Find My Ticket</a> with your email and code " + code + "."
                + "</p>"
                + "</div></div></body></html>";
    }

    private String buildTicketUrl(String ticketCode) {
        return publicBaseUrl + "/ticket/" + URLEncoder.encode(ticketCode, StandardCharsets.UTF_8);
    }

    private static JavaMailSender buildMailSender(
            boolean enabled,
            String host,
            int port,
            String username,
            String password,
            boolean smtpAuth,
            boolean starttls) {
        if (!enabled || host == null || host.isBlank()) {
            return null;
        }
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host.trim());
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);
        sender.setDefaultEncoding(StandardCharsets.UTF_8.name());

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(smtpAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(starttls));
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        return sender;
    }

    private static String stripTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5173";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
