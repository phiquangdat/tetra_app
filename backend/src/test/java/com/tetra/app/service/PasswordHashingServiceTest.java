package com.tetra.app.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PasswordHashingServiceTest {

    private final PasswordHashingService passwordHashingService = new PasswordHashingService();

    @Test
    public void testPasswordHashingAndVerification() {
        // 1. Simulate receiving a plain password from the frontend
        String plainPassword = "SuperSecure123";

        // 2. Simulate saving to the database (hash the password)
        String hashedPassword = passwordHashingService.hashPassword(plainPassword);

        // 3. Ensure the hashed password is not the same as the plain one
        assertNotEquals(plainPassword, hashedPassword, "Hashed password should not match plain password");

        // 4. Simulate login: verify that the hashed password matches the plain input
        boolean match = passwordHashingService.verifyPassword(plainPassword, hashedPassword);
        assertTrue(match, "Hashed password should match the correct plain password");

        // 5. Simulate login with incorrect password
        boolean wrongMatch = passwordHashingService.verifyPassword("WrongPassword!", hashedPassword);
        assertFalse(wrongMatch, "Hashed password should not match incorrect plain password");
    }
}
