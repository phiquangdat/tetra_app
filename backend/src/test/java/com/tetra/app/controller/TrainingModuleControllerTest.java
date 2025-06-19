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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
        module.setStatus("draft"); // Use allowed status

        // Set up the saved module with an id
        TrainingModule savedModule = new TrainingModule();
        savedModule.setId(UUID.fromString("00000000-0000-0000-0000-000000000010"));
        savedModule.setTitle("New Module");
        savedModule.setDescription("New Description");
        savedModule.setPoints(20);
        savedModule.setTopic("New Topic");
        savedModule.setCoverurl("new_cover.jpg");
        savedModule.setStatus("draft"); // Use allowed status

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
        // Assert that the error message is one of the expected messages
        assertTrue(errorMessage.contains("required"));
    }

    @Test
    @WithMockUser
    void testCreateModule_MissingFields() throws Exception {
        TrainingModule module = new TrainingModule();
        // Intentionally leaving out required fields like title, description, etc.
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
        // Assert that the error message is one of the expected messages
        assertTrue(errorMessage.contains("required"));
    }
}
