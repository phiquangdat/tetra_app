package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.dto.UserUnitProgressDto;
import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.repository.UserUnitProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserUnitProgressController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserUnitProgressControllerGetTest {

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
        UUID unitId = UUID.randomUUID();
        mockMvc.perform(get("/api/user-unit-progress/" + unitId))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        UUID unitId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(get("/api/user-unit-progress/" + unitId)
                .header("Authorization", "Bearer badtoken"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void returns400IfUserIdNotUUID() throws Exception {
        UUID unitId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(get("/api/user-unit-progress/" + unitId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid userId in token"));
    }

    @Test
    void returns404IfProgressNotFound() throws Exception {
        UUID unitId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.empty());
        mockMvc.perform(get("/api/user-unit-progress/" + unitId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("User unit progress not found"));
    }

    @Test
    void returns200AndProgressDtoIfFound() throws Exception {
        UUID unitId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserUnitProgress progress = new UserUnitProgress();
        progress.setId(UUID.randomUUID());
        // ...set other fields as needed...
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userUnitProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Optional.of(progress));

        mockMvc.perform(get("/api/user-unit-progress/" + unitId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(progress.getId().toString()));
    }
}
