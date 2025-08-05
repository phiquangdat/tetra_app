package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.User;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.repository.UserUnitProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserUnitProgressController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserUnitProgressControllerTestPut {

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
    private UUID progressId;
    private UUID unitId;
    private User user;
    private Unit unit;
    private UserUnitProgress progress;

    @BeforeEach
    void setup() {
        userId = UUID.randomUUID();
        progressId = UUID.randomUUID();
        unitId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        unit = new Unit();
        unit.setId(unitId);
        progress = new UserUnitProgress();
        progress.setId(progressId);
        progress.setUser(user);
        progress.setUnit(unit);
    }

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .header("Authorization", "Bearer badtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid userId in token"));
    }

    @Test
    void returns404IfProgressNotFound() throws Exception {
        when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        when(userUnitProgressRepository.findById(progressId)).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("User unit progress not found"));
    }

    @Test
    void returns403IfProgressNotOwnedByUser() throws Exception {
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        progress.setUser(otherUser);
        when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        when(userUnitProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    void returns200OnSuccessfulUpdate() throws Exception {
        when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        when(userUnitProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(userUnitProgressRepository.save(any(UserUnitProgress.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> body = new HashMap<>();
        body.put("status", "COMPLETED");
        body.put("unit_id", unitId.toString());

        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void returns400IfInvalidLastVisitedUnitId() throws Exception {
        when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        when(userUnitProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        when(unitRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        Map<String, Object> body = new HashMap<>();
        body.put("unit_id", UUID.randomUUID().toString());

        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid unit_id"));
    }

    @Test
    void returns400IfInvalidLastVisitedUnitIdFormat() throws Exception {
        when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        when(userUnitProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        Map<String, Object> body = new HashMap<>();
        body.put("unit_id", "not-a-uuid");

        mockMvc.perform(put("/api/user-unit-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid unit_id format"));
    }
}
