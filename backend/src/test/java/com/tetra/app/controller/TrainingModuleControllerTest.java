package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.config.SecurityConfig;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@WebMvcTest(TrainingModuleController.class)
@Import(SecurityConfig.class)
class TrainingModuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrainingModuleRepository trainingModuleRepository;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @MockBean
    private JwtUtil jwtUtil;

    // Add mocks for cascade delete dependencies
    @MockBean
    private com.tetra.app.repository.UnitRepository unitRepository;
    @MockBean
    private com.tetra.app.repository.UnitContentRepository unitContentRepository;
    @MockBean
    private com.tetra.app.repository.QuestionRepository questionRepository;
    @MockBean
    private com.tetra.app.repository.AnswerRepository answerRepository;
    @MockBean
    private com.tetra.app.repository.UserModuleProgressRepository userModuleProgressRepository;
    @MockBean
    private com.tetra.app.repository.UserUnitProgressRepository userUnitProgressRepository;
    @MockBean
    private com.tetra.app.repository.UserContentProgressRepository userContentProgressRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void testGetAllModules() throws Exception {
        TrainingModule module = new TrainingModule();
        module.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        module.setTitle("Test");
        module.setDescription("Desc");
        module.setPoints(10);
        module.setTopic("Topic");
        module.setCoverurl("cover.jpg");
        module.setStatus("active");

        when(trainingModuleRepository.findAll()).thenReturn(Arrays.asList(module));
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        mockMvc.perform(get("/api/modules")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test"))
                .andExpect(jsonPath("$[0].status").value("active"));
    }

    @Test
    @WithMockUser
    void testGetModuleById_found() throws Exception {
        TrainingModule module = new TrainingModule();
        module.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        module.setTitle("Test");
        module.setDescription("Desc");
        module.setPoints(10);
        module.setTopic("Topic");
        module.setCoverurl("cover.jpg");
        module.setStatus("active");

        when(trainingModuleRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000001"))).thenReturn(Optional.of(module));
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        mockMvc.perform(get("/api/modules/00000000-0000-0000-0000-000000000001")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"))
                .andExpect(jsonPath("$.status").value("active"));
    }

    @Test
    @WithMockUser
    void testGetModuleById_notFound() throws Exception {
        when(trainingModuleRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000002"))).thenReturn(Optional.empty());
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        mockMvc.perform(get("/api/modules/00000000-0000-0000-0000-000000000002")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testCreateModule() throws Exception {
        TrainingModule module = new TrainingModule();
        module.setTitle("New Module");
        module.setDescription("New Description");
        module.setPoints(20);
        module.setTopic("New Topic");
        module.setCoverurl("new_cover.jpg");
        module.setStatus("draft");

        TrainingModule savedModule = new TrainingModule();
        savedModule.setId(UUID.fromString("00000000-0000-0000-0000-000000000010"));
        savedModule.setTitle("New Module");
        savedModule.setDescription("New Description");
        savedModule.setPoints(20);
        savedModule.setTopic("New Topic");
        savedModule.setCoverurl("new_cover.jpg");
        savedModule.setStatus("draft");

        when(trainingModuleRepository.save(any(TrainingModule.class))).thenReturn(savedModule);
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        mockMvc.perform(post("/api/modules")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(module)))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 200 || status == 201, "expected 200 or 201, got " + status);
                })
                .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000010"))
                .andExpect(jsonPath("$.title").value("New Module"))
                .andExpect(jsonPath("$.points").value(20));
    }

    @Test
    @WithMockUser
    void testCreateModule_BadRequest() throws Exception {
        TrainingModule module = new TrainingModule();
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        MvcResult result = mockMvc.perform(post("/api/modules")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(module)))
                .andExpect(status().isBadRequest())
                .andReturn();

        String errorMessage = result.getResponse().getContentAsString();
        assertTrue(errorMessage.contains("required"));
    }

    @Test
    @WithMockUser
    void testCreateModule_MissingFields() throws Exception {
        TrainingModule module = new TrainingModule();
        module.setTitle(null);
        module.setDescription(null);
        module.setPoints(null);
        module.setTopic(null);
        module.setCoverurl(null);
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        MvcResult result = mockMvc.perform(post("/api/modules")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(module)))
                .andExpect(status().isBadRequest())
                .andReturn();

        String errorMessage = result.getResponse().getContentAsString();
        assertTrue(errorMessage.contains("required"));
    }

    @Test
    @WithMockUser
    void testUpdateModule_Success() throws Exception {
        UUID moduleId = UUID.fromString("00000000-0000-0000-0000-000000000005");

        TrainingModule existing = new TrainingModule();
        existing.setId(moduleId);
        existing.setTitle("Old Title");
        existing.setDescription("Old Desc");
        existing.setTopic("Old Topic");
        existing.setPoints(5);
        existing.setCoverurl("old.jpg");
        existing.setStatus("draft");

        TrainingModule updated = new TrainingModule();
        updated.setTitle("Updated Title");
        updated.setDescription("Updated Desc");
        updated.setTopic("Updated Topic");
        updated.setPoints(15);
        updated.setCoverurl("updated.jpg");
        updated.setStatus("published");

        TrainingModule saved = new TrainingModule();
        saved.setId(moduleId);
        saved.setTitle("Updated Title");
        saved.setDescription("Updated Desc");
        saved.setTopic("Updated Topic");
        saved.setPoints(15);
        saved.setCoverurl("updated.jpg");
        saved.setStatus("published");

        when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(existing));
        when(trainingModuleRepository.save(any(TrainingModule.class))).thenReturn(saved);
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        mockMvc.perform(put("/api/modules/" + moduleId)
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(moduleId.toString()))
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.status").value("published"));
    }

    @Test
    @WithMockUser
    void testUpdateModule_MissingRequiredFields() throws Exception {
        UUID moduleId = UUID.randomUUID();

        TrainingModule existing = new TrainingModule();
        existing.setId(moduleId);
        existing.setTitle("Old Title");
        existing.setDescription("Old Desc");
        existing.setTopic("Old Topic");
        existing.setPoints(5);
        existing.setCoverurl("old.jpg");
        existing.setStatus("draft");

        when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(existing));
        when(trainingModuleRepository.save(any(TrainingModule.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        TrainingModule updated = new TrainingModule(); // No fields set

        mockMvc.perform(put("/api/modules/" + moduleId)
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(moduleId.toString()));
    }

    @Test
    @WithMockUser
    void testUpdateModule_NotFound() throws Exception {
        UUID moduleId = UUID.fromString("00000000-0000-0000-0000-000000000099");

        TrainingModule updated = new TrainingModule();
        updated.setTitle("Title");
        updated.setDescription("Desc");
        updated.setTopic("Topic");
        updated.setPoints(10);
        updated.setCoverurl("cover.jpg");
        updated.setStatus("draft");

        when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.empty());
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");

        mockMvc.perform(put("/api/modules/" + moduleId)
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testDeleteModule_AdminSuccess() throws Exception {
        UUID moduleId = UUID.randomUUID();
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");
        when(trainingModuleRepository.existsById(moduleId)).thenReturn(true);

        // Mock cascade delete calls
        when(userModuleProgressRepository.findByModule_Id(moduleId)).thenReturn(java.util.Collections.emptyList());
        when(unitRepository.findByModule_Id(moduleId)).thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(delete("/api/modules/" + moduleId)
                .header("Authorization", "Bearer test-token"))
            .andExpect(status().isOk())
            .andExpect(content().string("Module deleted successfully"));
    }

    @Test
    @WithMockUser
    void testDeleteModule_ForbiddenForNonAdmin() throws Exception {
        UUID moduleId = UUID.randomUUID();
        when(jwtUtil.extractRole(anyString())).thenReturn("LEARNER");

        mockMvc.perform(delete("/api/modules/" + moduleId)
                .header("Authorization", "Bearer test-token"))
            .andExpect(status().isForbidden())
            .andExpect(content().string("Access denied"));
    }

    @Test
    @WithMockUser
    void testDeleteModule_UnauthorizedMissingHeader() throws Exception {
        UUID moduleId = UUID.randomUUID();

        mockMvc.perform(delete("/api/modules/" + moduleId))
            .andExpect(status().isUnauthorized())
            .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    @WithMockUser
    void testDeleteModule_UnauthorizedInvalidToken() throws Exception {
        UUID moduleId = UUID.randomUUID();
        when(jwtUtil.extractRole(anyString())).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(delete("/api/modules/" + moduleId)
                .header("Authorization", "Bearer invalidtoken"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().string("Invalid token"));
    }

    @Test
    @WithMockUser
    void testDeleteModule_NotFound() throws Exception {
        UUID moduleId = UUID.randomUUID();
        when(jwtUtil.extractRole(anyString())).thenReturn("ADMIN");
        when(trainingModuleRepository.existsById(moduleId)).thenReturn(false);

        mockMvc.perform(delete("/api/modules/" + moduleId)
                .header("Authorization", "Bearer test-token"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Module not found with id: " + moduleId));
    }
}
