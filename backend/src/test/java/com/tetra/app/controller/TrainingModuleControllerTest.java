package com.tetra.app.controller;

import com.tetra.app.config.SecurityConfig;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.repository.TrainingModuleRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TrainingModuleController.class)
@Import(SecurityConfig.class)
class TrainingModuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrainingModuleRepository trainingModuleRepository;

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

        when(trainingModuleRepository.findAll()).thenReturn(Arrays.asList(module));

        mockMvc.perform(get("/api/modules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test"));
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

        when(trainingModuleRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000001"))).thenReturn(Optional.of(module));

        mockMvc.perform(get("/api/modules/00000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"));
    }

    @Test
    @WithMockUser
    void testGetModuleById_notFound() throws Exception {
        when(trainingModuleRepository.findById(UUID.fromString("00000000-0000-0000-0000-000000000002"))).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/modules/00000000-0000-0000-0000-000000000002"))
                .andExpect(status().isNotFound());
    }
}
