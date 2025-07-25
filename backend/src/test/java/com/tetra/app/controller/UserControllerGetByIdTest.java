package com.tetra.app.controller;

import com.tetra.app.model.Role;
import com.tetra.app.model.User;
import com.tetra.app.service.UserService;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerGetByIdTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    private UUID userId;
    private User user;

    @BeforeEach
    public void setup() {
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setRole(Role.LEARNER);
    }

    @Test
    public void getUserById_UserExists_ReturnsUserInfo() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");
        when(userService.getUserById(userId)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/" + userId)
                .header("Authorization", "Bearer validtoken")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("LEARNER"));
    }

    @Test
    public void getUserById_UserNotFound_ReturnsNotFound() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");
        when(userService.getUserById(userId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/" + userId)
                .header("Authorization", "Bearer validtoken")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void getUserById_MissingAuthorizationHeader_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/users/" + userId))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    public void getUserById_InvalidToken_ReturnsUnauthorized() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenThrow(new RuntimeException("Invalid JWT token"));

        mockMvc.perform(get("/api/users/" + userId)
                .header("Authorization", "Bearer invalidtoken"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    public void getUserById_NonAdminRole_ReturnsForbidden() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenReturn("LEARNER");

        mockMvc.perform(get("/api/users/" + userId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }
    
    @Test
    public void getUserById_Success_ReturnsUserInfo() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");
        User user = new User();
        user.setId(UUID.fromString(userId.toString()));
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setRole(Role.LEARNER);
        when(userService.getUserById(UUID.fromString(userId.toString()))).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/" + userId)
                .header("Authorization", "Bearer validtoken"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("LEARNER"));
    }
}
