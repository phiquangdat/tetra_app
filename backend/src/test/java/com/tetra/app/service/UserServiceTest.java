package com.tetra.app.service;

import com.tetra.app.model.Role;
import com.tetra.app.model.User;
import com.tetra.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;

class UserServiceTest {

    private UserRepository userRepository;
    private PasswordHashingService passwordHashingService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordHashingService = Mockito.mock(PasswordHashingService.class);
        userService = new UserService(userRepository, passwordHashingService);

        Mockito.when(passwordHashingService.hashPassword(anyString())).thenReturn("hashed");
        Mockito.when(passwordHashingService.verifyPassword(Mockito.anyString(), Mockito.anyString()))
                .thenAnswer(invocation -> invocation.getArgument(0).equals("oldpass") && invocation.getArgument(1).equals("hashed"));
    }

    @Test
    void createUser_success() {
        Mockito.when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        Mockito.when(userRepository.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));

        User user = userService.createUser("Test", "test@example.com", "password", Role.LEARNER);
        assertEquals("Test", user.getName());
        assertEquals("test@example.com", user.getEmail());
        assertEquals(Role.LEARNER, user.getRole());
        assertEquals("hashed", user.getPassword());
    }

    @Test
    void createUser_duplicateEmail_throws() {
        Mockito.when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () ->
            userService.createUser("Test", "test@example.com", "password", Role.LEARNER)
        );
    }

    @Test
    void updateUser_changeNameAndEmail_success() {
        User user = new User();
        user.setName("Old");
        user.setEmail("old@example.com");
        user.setPassword("hashed");

        Mockito.when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        Mockito.when(userRepository.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));

        User updated = userService.updateUser(user, "New", "new@example.com", null, null);
        assertEquals("New", updated.getName());
        assertEquals("new@example.com", updated.getEmail());
    }

    @Test
    void updateUser_changePassword_success() {
        User user = new User();
        user.setPassword("hashed");

        Mockito.when(userRepository.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));

        User updated = userService.updateUser(user, null, null, "newpass", "oldpass");
        assertEquals("hashed", updated.getPassword());
    }

    @Test
    void updateUser_wrongOldPassword_throws() {
        User user = new User();
        user.setPassword("hashed");

        assertThrows(IllegalArgumentException.class, () ->
            userService.updateUser(user, null, null, "newpass", "wrongpass")
        );
    }

    @Test
    void updateUser_shortPassword_throws() {
        User user = new User();
        user.setPassword("hashed");

        assertThrows(IllegalArgumentException.class, () ->
            userService.updateUser(user, null, null, "123", "oldpass")
        );
    }
}
