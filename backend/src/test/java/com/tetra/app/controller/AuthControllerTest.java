package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.dto.LoginRequest;
import com.tetra.app.model.Role;
import com.tetra.app.model.User;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.service.PasswordHashingService;
import com.tetra.app.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(AuthControllerTest.TestSecurityConfig.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private PasswordHashingService passwordHashingService;

    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private final String email = "test@example.com";
    private final String password = "password123";

    @TestConfiguration
    static class TestSecurityConfig{
        protected void configure(HttpSecurity http) throws Exception {
            http
                    .csrf().disable()
                    .authorizeHttpRequests()
                    .requestMatchers("/api/auth/login").permitAll()
                    .anyRequest().authenticated()
                    .and()
                    .sessionManagement().disable();
        }
    }

    @Test
    public void testLoginSuccess() throws Exception {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setPassword("hashedPassword");
        user.setRole(Role.LEARNER);

        when(userService.getUserByEmail(email)).thenReturn(Optional.of(user));
        when(passwordHashingService.verifyPassword(password, user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("mocked-jwt-token");

        LoginRequest request = new LoginRequest(email, password);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.role").value("LEARNER"))
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"));
    }

    @Test
    public void testLoginFailure_wrongPassword() throws Exception {
        User user = new User();
        user.setEmail(email);
        user.setPassword("hashedPassword");

        when(userService.getUserByEmail(email)).thenReturn(Optional.of(user));
        when(passwordHashingService.verifyPassword(anyString(), anyString())).thenReturn(false);

        LoginRequest request = new LoginRequest(email, "wrong-password");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testLoginFailure_unknownEmail() throws Exception {
        when(userService.getUserByEmail(anyString())).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("unknown@example.com", password);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}