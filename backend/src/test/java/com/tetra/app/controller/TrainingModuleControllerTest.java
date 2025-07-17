package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.config.SecurityConfig;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.repository.TrainingModuleRepository;
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

        mockMvc.perform(get("/api/modules"))
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

        mockMvc.perform(get("/api/modules/00000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"))
                .andExpect(jsonPath("$.status").value("active"));
    }

    @Test
    @WithMockUser
    void testGetModuleById_notFound() throws Exception {
        when(trainingModuleRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000002"))).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/modules/00000000-0000-0000-0000-000000000002"))
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

        mockMvc.perform(post("/api/modules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(module)))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 200 || status == 201, "expected 200 or 201, got " + status);
                })
                .andExpect(jsonPath("$.id").value("00000000-0000-0000-0000-000000000010"))
                .andExpect(jsonPath("$.title").value("New Module"))
                .andExpect(jsonPath("$.description").doesNotExist())
                .andExpect(jsonPath("$.points").doesNotExist())
                .andExpect(jsonPath("$.topic").doesNotExist())
                .andExpect(jsonPath("$.coverurl").doesNotExist())
                .andExpect(jsonPath("$.status").doesNotExist());
    }

    @Test
    @WithMockUser
    void testCreateModule_BadRequest() throws Exception {
        TrainingModule module = new TrainingModule();

        MvcResult result = mockMvc.perform(post("/api/modules")
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

        MvcResult result = mockMvc.perform(post("/api/modules")
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

        mockMvc.perform(put("/api/modules/" + moduleId)
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

        TrainingModule updated = new TrainingModule(); // Missing required fields

        mockMvc.perform(put("/api/modules/" + moduleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("required")));
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

        mockMvc.perform(put("/api/modules/" + moduleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isNotFound());
    }
}
