package com.tetra.app.controller;

import com.tetra.app.TestSecurityConfig;
import com.tetra.app.model.*;
import com.tetra.app.repository.*;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserModuleProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(TestSecurityConfig.class)
public class UserModuleProgressControllerTestGet {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserModuleProgressRepository userModuleProgressRepository;
    @MockBean
    private TrainingModuleRepository trainingModuleRepository;
    @MockBean
    private UserRepository userRepository;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private UnitRepository unitRepository;
    @MockBean
    private UnitContentRepository unitContentRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        UUID moduleId = UUID.randomUUID();
        mockMvc.perform(get("/api/user-module-progress/" + moduleId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        UUID moduleId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(get("/api/user-module-progress/" + moduleId)
                .header("Authorization", "Bearer badtoken"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        UUID moduleId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(get("/api/user-module-progress/" + moduleId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns404IfProgressNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId))
                .thenReturn(Optional.empty());
        mockMvc.perform(get("/api/user-module-progress/" + moduleId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns200AndProgressDataOnSuccess() throws Exception {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID contentId = UUID.randomUUID();

        UserModuleProgress progress = new UserModuleProgress();
        progress.setId(id);
        progress.setStatus(ProgressStatus.IN_PROGRESS);
        progress.setEarnedPoints(42);

        Unit unit = new Unit();
        unit.setId(unitId);
        progress.setLastVisitedUnit(unit);

        UnitContent content = new UnitContent();
        content.setId(contentId);
        progress.setLastVisitedContent(content);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId))
                .thenReturn(Optional.of(progress));

        mockMvc.perform(get("/api/user-module-progress/" + moduleId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.last_visited_unit_id").value(unitId.toString()))
                .andExpect(jsonPath("$.last_visited_content_id").value(contentId.toString()))
                .andExpect(jsonPath("$.earned_points").value(42));
    }
}
