package com.tetra.app.model;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testGettersAndSetters() {
        User user = new User();

        UUID id = UUID.randomUUID();
        user.setId(id);
        assertEquals(id, user.getId());

        user.setName("Alice");
        assertEquals("Alice", user.getName());

        user.setEmail("alice@example.com");
        assertEquals("alice@example.com", user.getEmail());

        user.setPassword("securePassword");
        assertEquals("securePassword", user.getPassword());

        user.setRole(Role.ADMIN);
        assertEquals(Role.ADMIN, user.getRole());
    }

    @Test
    void testNoArgsConstructor() {
        User user = new User();
        assertNotNull(user);
    }
}