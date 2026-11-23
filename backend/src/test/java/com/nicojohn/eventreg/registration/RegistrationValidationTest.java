package com.nicojohn.eventreg.registration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.nicojohn.eventreg.registration.dto.RegisterRequest;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class RegistrationValidationTest {

    private static Validator validator;

    @BeforeAll
    static void initValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private Set<String> invalidFields(RegisterRequest req) {
        return validator.validate(req).stream()
                .map(v -> v.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    @Test
    void acceptsValidInputs() {
        var req = new RegisterRequest("Juan Dela Cruz", "juan.delacruz@example.com", "09171234567");
        assertTrue(invalidFields(req).isEmpty());
    }

    @Test
    void rejectsEmptyAndWhitespaceOnlyFields() {
        assertEquals(Set.of("fullName", "email", "mobile"), invalidFields(new RegisterRequest("", "", "")));
        assertEquals(Set.of("fullName"), invalidFields(new RegisterRequest("   ", "space@example.com", "09171234567")));
    }

    @Test
    void rejectsInvalidEmails() {
        assertEquals(Set.of("email"), invalidFields(new RegisterRequest("Juan", "juan@", "09171234567")));
        assertEquals(Set.of("email"), invalidFields(new RegisterRequest("Juan", "juan.example.com", "09171234567")));
    }

    @Test
    void rejectsInvalidPhMobileFormats() {
        assertEquals(Set.of("mobile"), invalidFields(new RegisterRequest("Juan", "j@example.com", "0917123456")));
        assertEquals(Set.of("mobile"), invalidFields(new RegisterRequest("Juan", "j@example.com", "091712345678")));
        assertEquals(Set.of("mobile"), invalidFields(new RegisterRequest("Juan", "j@example.com", "08171234567")));
        assertEquals(Set.of("mobile"), invalidFields(new RegisterRequest("Juan", "j@example.com", "0917abc4567")));
        assertEquals(Set.of("mobile"), invalidFields(new RegisterRequest("Juan", "j@example.com", "+639171234567")));
    }

    @Test
    void reportsBothEmailAndMobileErrorsTogether() {
        var req = new RegisterRequest("Juan Dela Cruz", "juan@", "0917123456");
        assertEquals(Set.of("email", "mobile"), invalidFields(req));
    }
}
