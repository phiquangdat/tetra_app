package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.UserContentProgress;
import com.tetra.app.model.Unit;
import com.tetra.app.model.User;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UserContentProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.security.JwtUtil;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserContentProgressController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserContentProgressControllerGetTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserContentProgressRepository userContentProgressRepository;
    @MockBean
    private UserRepository userRepository;
    @MockBean
    private UnitRepository unitRepository;
    @MockBean
    private UnitContentRepository unitContentRepository;
    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        mockMvc.perform(get("/api/users-content-progress")
                .param("unitId", UUID.randomUUID().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(get("/api/users-content-progress")
                .header("Authorization", "Bearer badtoken")
                .param("unitId", UUID.randomUUID().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void returns400IfInvalidUserIdOrUnitId() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(get("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .param("unitId", "not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid userId or unitId format"));
    }

    @Test
    void returns404IfNoProgressFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .param("unitId", unitId.toString()))
                .andExpect(status().isNotFound())
                .andExpect(content().string("No progress found for this unit"));
    }

    @Test
    void returns200AndProgressListIfFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID progressId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        Unit unit = new Unit();
        unit.setId(unitId);
        UnitContent unitContent = new UnitContent();
        unitContent.setId(UUID.randomUUID());

        UserContentProgress progress = new UserContentProgress();
        progress.setId(progressId);
        progress.setUser(user);
        progress.setUnit(unit);
        progress.setUnitContent(unitContent);
        progress.setStatus("COMPLETED");
        progress.setPoints(100);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findByUser_IdAndUnit_Id(userId, unitId))
                .thenReturn(List.of(progress));

        mockMvc.perform(get("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .param("unitId", unitId.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(progressId.toString()))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[0].points").value(100));
    }
}
