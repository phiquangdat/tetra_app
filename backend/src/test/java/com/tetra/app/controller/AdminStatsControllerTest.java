package com.tetra.app.controller;

import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UserModuleProgressRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminStatsController.class)
@Import(com.tetra.app.TestSecurityConfig.class)
public class AdminStatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private TrainingModuleRepository trainingModuleRepository;

    @MockBean
    private UserModuleProgressRepository userModuleProgressRepository;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void returnsStatsWhenUserHasAdminRole() throws Exception {
        when(userRepository.count()).thenReturn(348L);
        when(trainingModuleRepository.sumPoints()).thenReturn(125000L);
        when(trainingModuleRepository.countByStatus("published")).thenReturn(45L);

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.total_users").value(348))
                .andExpect(jsonPath("$.total_points_issued").value(125000))
                .andExpect(jsonPath("$.active_modules").value(45));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void returnsModuleCompletionsByTopic() throws Exception {
        var mockResult = java.util.List.of(
            new UserModuleProgressRepository.TopicCompletionsProjection() {
                public String getTopic() { return "Cybersecurity"; }
                public Long getCompletions() { return 123L; }
            },
            new UserModuleProgressRepository.TopicCompletionsProjection() {
                public String getTopic() { return "AI"; }
                public Long getCompletions() { return 0L; }
            }
        );
        org.mockito.Mockito.when(userModuleProgressRepository.findModuleCompletionsPerTopic()).thenReturn(mockResult);

        mockMvc.perform(get("/api/admin/stats/module-completions-by-topic"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$[0].topic").value("Cybersecurity"))
            .andExpect(jsonPath("$[0].completions").value(123))
            .andExpect(jsonPath("$[1].topic").value("AI"))
            .andExpect(jsonPath("$[1].completions").value(0));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void ensuresCorrectContentTypeHeader() throws Exception {
        when(userRepository.count()).thenReturn(100L);
        when(trainingModuleRepository.sumPoints()).thenReturn(5000L);
        when(trainingModuleRepository.countByStatus("published")).thenReturn(20L);

        mockMvc.perform(get("/api/admin/stats")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/json"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}