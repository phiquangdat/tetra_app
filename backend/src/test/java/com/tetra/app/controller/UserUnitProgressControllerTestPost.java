package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserUnitProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserUnitProgressControllerTestPost {

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

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        mockMvc.perform(post("/api/user-unit-progress")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer badtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns400IfModuleIdOrUnitIdOrStatusMissing() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(UUID.randomUUID().toString());
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns400IfModuleIdOrUnitIdInvalidFormat() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(UUID.randomUUID().toString());
        Map<String, String> body = new HashMap<>();
        body.put("moduleId", "bad-uuid");
        body.put("unitId", "bad-uuid");
        body.put("status", "IN_PROGRESS");
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns409IfProgressAlreadyExists() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.of(new UserUnitProgress()));
        Map<String, String> body = new HashMap<>();
        body.put("moduleId", moduleId.toString());
        body.put("unitId", unitId.toString());
        body.put("status", "IN_PROGRESS");
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    @Test
    void returns404IfUserNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.empty());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.empty());
        Map<String, String> body = new HashMap<>();
        body.put("moduleId", moduleId.toString());
        body.put("unitId", unitId.toString());
        body.put("status", "IN_PROGRESS");
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns404IfModuleNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.empty());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.empty());
        Map<String, String> body = new HashMap<>();
        body.put("moduleId", moduleId.toString());
        body.put("unitId", unitId.toString());
        body.put("status", "IN_PROGRESS");
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns404IfUnitNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.empty());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(new TrainingModule()));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.empty());
        Map<String, String> body = new HashMap<>();
        body.put("moduleId", moduleId.toString());
        body.put("unitId", unitId.toString());
        body.put("status", "IN_PROGRESS");
        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns201OnSuccess() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        TrainingModule module = new TrainingModule();
        module.setId(moduleId);
        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setTitle("Test Unit");
        unit.setDescription("Test Description");
        unit.setModule(module); // <-- add this line

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.empty());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        Mockito.when(userUnitProgressRepository.save(any(UserUnitProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, String> body = new HashMap<>();
        body.put("moduleId", moduleId.toString());
        body.put("unitId", unitId.toString());
        body.put("status", "IN_PROGRESS");

        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void returns400IfUnitDoesNotBelongToModule() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID wrongModuleId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        TrainingModule module = new TrainingModule();
        module.setId(moduleId);
        TrainingModule wrongModule = new TrainingModule();
        wrongModule.setId(wrongModuleId);
        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setModule(wrongModule); // unit belongs to a different module
        unit.setTitle("Test Unit");
        unit.setDescription("Test Description");

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.empty());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        Map<String, String> body = new HashMap<>();
        body.put("moduleId", moduleId.toString());
        body.put("unitId", unitId.toString());
        body.put("status", "IN_PROGRESS");

        mockMvc.perform(post("/api/user-unit-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }
}
