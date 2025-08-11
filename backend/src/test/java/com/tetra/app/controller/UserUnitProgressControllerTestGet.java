package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.model.User;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.repository.UserUnitProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserUnitProgressController.class)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserUnitProgressControllerTestGet {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserUnitProgressRepository userUnitProgressRepository;
    @MockBean
    private UserRepository userRepository;
    @MockBean
    private TrainingModuleRepository trainingModuleRepository;
    @MockBean
    private UnitRepository unitRepository;
    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID userId;
    private UUID moduleId;
    private UUID unitId;
    private User user;
    private TrainingModule module;
    private Unit unit;

    @BeforeEach
    void setup() {
        userId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        unitId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        module = new TrainingModule();
        module.setId(moduleId);
        unit = new Unit();
        unit.setId(unitId);
        unit.setModule(module);
    }

    @Test
    void testGetUserUnitProgressByModuleId_MissingAuthHeader() throws Exception {
        mockMvc.perform(get("/api/user-unit-progress")
                .param("moduleId", moduleId.toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void testGetUserUnitProgressByModuleId_InvalidToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(get("/api/user-unit-progress")
                .header("Authorization", "Bearer badtoken")
                .param("moduleId", moduleId.toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void testGetUserUnitProgressByModuleId_InvalidUUIDFormat() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(get("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .param("moduleId", "not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid userId or moduleId format"));
    }

    @Test
    void testGetUserUnitProgressByModuleId_EmptyProgressList() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndModule_Id(userId, moduleId))
                .thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .param("moduleId", moduleId.toString()))
                .andExpect(status().isNotFound())
                .andExpect(content().string("No progress found for this module"));
    }

    @Test
    void testGetUserUnitProgressByModuleId_Success() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        UserUnitProgress progress = new UserUnitProgress();
        progress.setId(UUID.randomUUID());
        progress.setUser(user);
        progress.setModule(module);
        progress.setUnit(unit);
        progress.setStatus("COMPLETED");
        Mockito.when(userUnitProgressRepository.findByUser_IdAndModule_Id(userId, moduleId))
                .thenReturn(List.of(progress));
        mockMvc.perform(get("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .param("moduleId", moduleId.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(progress.getId().toString()))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[0].userId").value(userId.toString()))
                .andExpect(jsonPath("$[0].moduleId").value(moduleId.toString()))
                .andExpect(jsonPath("$[0].unitId").value(unitId.toString()));
    }
}
