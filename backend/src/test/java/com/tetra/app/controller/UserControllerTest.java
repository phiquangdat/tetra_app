package com.tetra.app.controller;

import com.tetra.app.dto.CreateUserRequest;
import com.tetra.app.model.Role;
import com.tetra.app.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import org.springframework.http.MediaType;

import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

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
    }


    @Test
    public void createUser_InvalidRole_ReturnsBadRequest() throws Exception {
        validRequest.setRole("invalidrole");

        mockMvc.perform(post("/api/users")
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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).createUser(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    public void createUser_BlankEmail_ReturnsBadRequest() throws Exception {
        validRequest.setEmail("");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).createUser(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    public void createUser_ShortPassword_ReturnsBadRequest() throws Exception {
        validRequest.setPassword("123");

        mockMvc.perform(post("/api/users")
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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Unexpected error: DB down"));
    }
}