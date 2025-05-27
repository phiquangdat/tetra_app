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
        module.setId(1L);
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
        module.setId(1L);
        module.setTitle("Test");
        module.setDescription("Desc");
        module.setPoints(10);
        module.setTopic("Topic");
        module.setCoverurl("cover.jpg");

        when(trainingModuleRepository.findById(1L)).thenReturn(Optional.of(module));

        mockMvc.perform(get("/api/modules/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"));
    }

    @Test
    @WithMockUser
    void testGetModuleById_notFound() throws Exception {
        when(trainingModuleRepository.findById(2L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/modules/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testPing() throws Exception {
        mockMvc.perform(get("/api/modules/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string("pong"));
    }
}
