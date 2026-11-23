package com.nicojohn.eventreg.registration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.nicojohn.eventreg.registration.dto.TicketLookupRequest;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class TicketLookupValidationTest {

    private static Validator validator;

    @BeforeAll
    static void initValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private Set<String> invalidFields(TicketLookupRequest req) {
        return validator.validate(req).stream()
                .map(v -> v.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    @Test
    void acceptsValidAndProbeTicketCodesWithValidEmail() {
        assertTrue(invalidFields(new TicketLookupRequest("CDM-7K3P9Q", "juan.delacruz@example.com")).isEmpty());
        assertTrue(invalidFields(new TicketLookupRequest("  cdm-7k3p9q ", "  JUAN@EXAMPLE.COM ")).isEmpty());
        assertTrue(invalidFields(new TicketLookupRequest("' OR '1'='1", "juan.delacruz@example.com")).isEmpty());
    }

    @Test
    void rejectsBlankCodeAndInvalidEmail() {
        assertEquals(Set.of("ticketCode", "email"), invalidFields(new TicketLookupRequest("", "")));
        assertEquals(Set.of("email"), invalidFields(new TicketLookupRequest("CDM-7K3P9Q", "not-an-email")));
    }
}
