package com.tetra.app.controller;

import com.tetra.app.TestSecurityConfig;
import com.tetra.app.model.BlacklistedToken;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.service.PasswordHashingService;
import com.tetra.app.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.context.annotation.Import;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(TestSecurityConfig.class)
public class AuthControllerLogoutTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private PasswordHashingService passwordHashingService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    // Helper to perform logout request
    private void performLogout(String authHeader, int expectedStatus, String expectedContent) throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", authHeader)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is(expectedStatus))
                .andExpect(content().string(org.hamcrest.Matchers.containsString(expectedContent)));
    }

    @Test
    void logout_success() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = "mocked.jwt.token.success";
        String authHeader = "Bearer " + token;

        when(jwtUtil.extractUserId(token)).thenReturn(userId.toString());
        when(blacklistedTokenRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        performLogout(authHeader, 200, "Logged out successfully. User ID: " + userId);

        ArgumentCaptor<BlacklistedToken> captor = ArgumentCaptor.forClass(BlacklistedToken.class);
        verify(blacklistedTokenRepository, times(1)).save(captor.capture());
        BlacklistedToken saved = captor.getValue();
        Assertions.assertEquals(token, saved.getToken());
        Assertions.assertEquals(userId, saved.getUserId());
    }

    @Test
    void logout_duplicateToken_blacklist() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = "mocked.jwt.token.duplicate";
        String authHeader = "Bearer " + token;

        when(jwtUtil.extractUserId(token)).thenReturn(userId.toString());
        when(blacklistedTokenRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(blacklistedTokenRepository.existsByToken(token)).thenReturn(false).thenReturn(true);

        // First logout
        performLogout(authHeader, 200, "Logged out successfully. User ID: " + userId);
        // Second logout (should still succeed, but token is already blacklisted)
        performLogout(authHeader, 200, "Logged out successfully. User ID: " + userId);

        verify(blacklistedTokenRepository, times(2)).save(any(BlacklistedToken.class));
    }

    @Test
    void logout_blacklistPersistence() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = "mocked.jwt.token.persist";
        String authHeader = "Bearer " + token;

        when(jwtUtil.extractUserId(token)).thenReturn(userId.toString());
        when(blacklistedTokenRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(blacklistedTokenRepository.existsByToken(token)).thenReturn(true);

        performLogout(authHeader, 200, "Logged out successfully. User ID: " + userId);

        Assertions.assertTrue(blacklistedTokenRepository.existsByToken(token));
    }

    @Test
    void logout_missingAuthorizationHeader() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));

        verify(blacklistedTokenRepository, never()).save(any());
    }

    @Test
    void logout_invalidAuthorizationHeaderFormat() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Token something")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));

        verify(blacklistedTokenRepository, never()).save(any());
    }

    @Test
    void logout_invalidToken() throws Exception {
        String token = "mocked.jwt.token.invalid";
        String authHeader = "Bearer " + token;
        when(jwtUtil.extractUserId(token)).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", authHeader)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }
}

