package com.tetra.app.controller;

import com.tetra.app.dto.CreateUserRequest;
import com.tetra.app.model.Role;
import com.tetra.app.service.UserService;
import com.tetra.app.service.PasswordHashingService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;

import org.springframework.http.MediaType;

import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.tetra.app.security.JwtUtil;
import com.tetra.app.model.User;
import com.tetra.app.repository.BlacklistedTokenRepository;
import java.util.List;
import java.util.UUID;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(PasswordHashingService.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateUserRequest validRequest;

    @BeforeEach
    public void setup() {
        validRequest = new CreateUserRequest();
        validRequest.setName("John Doe");
        validRequest.setEmail("john@example.com");
        validRequest.setPassword("password123");
        validRequest.setRole("LEARNER");
        // Default: mock ADMIN role for createUser tests
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");
    }


    @Test
    public void createUser_InvalidRole_ReturnsBadRequest() throws Exception {
        validRequest.setRole("invalidrole");

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid role. Allowed roles: ADMIN, LEARNER"));

        verify(userService, never()).createUser(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    public void createUser_BlankName_ReturnsBadRequest() throws Exception {
        validRequest.setName("");

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).createUser(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    public void createUser_BlankEmail_ReturnsBadRequest() throws Exception {
        validRequest.setEmail("");

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).createUser(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    public void createUser_ShortPassword_ReturnsBadRequest() throws Exception {
        validRequest.setPassword("123");

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).createUser(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    public void createUser_ServiceThrowsIllegalArgumentException_ReturnsBadRequest() throws Exception {
        doThrow(new IllegalArgumentException("Email already exists"))
                .when(userService).createUser(anyString(), anyString(), anyString(), any(Role.class));

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Email already exists"));
    }

    @Test
    public void createUser_ServiceThrowsException_ReturnsInternalServerError() throws Exception {
        doThrow(new RuntimeException("DB down"))
                .when(userService).createUser(anyString(), anyString(), anyString(), any(Role.class));

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Unexpected error: DB down"));
    }

    @Test
    public void getAllUsers_MissingAuthorizationHeader_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    public void getAllUsers_InvalidToken_ReturnsUnauthorized() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenThrow(new RuntimeException("Invalid JWT token"));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/users")
                .header("Authorization", "Bearer invalidtoken"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    public void getAllUsers_NonAdminRole_ReturnsForbidden() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenReturn("LEARNER");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/users")
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    public void getAllUsers_AdminRole_ReturnsUserList() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        User user1 = new User();
        user1.setId(UUID.randomUUID());
        user1.setName("Alice");
        user1.setEmail("alice@example.com");
        user1.setRole(Role.ADMIN);

        User user2 = new User();
        user2.setId(UUID.randomUUID());
        user2.setName("Bob");
        user2.setEmail("bob@example.com");
        user2.setRole(Role.LEARNER);

        when(userService.getAllUsers()).thenReturn(List.of(user1, user2));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/users")
                .header("Authorization", "Bearer validtoken"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alice"))
                .andExpect(jsonPath("$[0].email").value("alice@example.com"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[1].name").value("Bob"))
                .andExpect(jsonPath("$[1].email").value("bob@example.com"))
                .andExpect(jsonPath("$[1].role").value("LEARNER"));
    }
}