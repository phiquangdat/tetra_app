package com.tetra.app.controller;

import com.tetra.app.service.UserStatsService;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserStatsControllerTest {

    private MockMvc mockMvc;
    private UserStatsService userStatsService;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        userStatsService = Mockito.mock(UserStatsService.class);
        jwtUtil = Mockito.mock(JwtUtil.class);
        UserStatsController controller = new UserStatsController(userStatsService, jwtUtil);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void shouldReturn401WhenAuthorizationHeaderIsMissing() throws Exception {
        mockMvc.perform(get("/api/user-stats"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void shouldReturn401WhenTokenIsInvalid() throws Exception {
        String invalidToken = "Bearer invalid.token.here";
        when(jwtUtil.extractUserId("invalid.token.here")).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(get("/api/user-stats")
                        .header("Authorization", invalidToken))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void shouldReturn400WhenUserIdIsInvalidUUID() throws Exception {
        String token = "valid.token";
        when(jwtUtil.extractUserId(token)).thenReturn("not-a-uuid");

        mockMvc.perform(get("/api/user-stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid userId in token"));
    }

    @Test
    void shouldReturnStatsSuccessfully() throws Exception {
        String token = "valid.token";
        UUID userId = UUID.randomUUID();
        when(jwtUtil.extractUserId(token)).thenReturn(userId.toString());
        when(userStatsService.getTotalPoints(userId)).thenReturn(120);
        when(userStatsService.getTopicPoints(userId)).thenReturn(List.of(
                Map.of("topic", "AI", "points", 100),
                Map.of("topic", "ESG", "points", 20)
        ));

        mockMvc.perform(get("/api/user-stats")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPoints").value(120))
                .andExpect(jsonPath("$.topicPoints").isArray())
                .andExpect(jsonPath("$.topicPoints[0].topic").value("AI"))
                .andExpect(jsonPath("$.topicPoints[0].points").value(100))
                .andExpect(jsonPath("$.topicPoints[1].topic").value("ESG"))
                .andExpect(jsonPath("$.topicPoints[1].points").value(20));
    }
}