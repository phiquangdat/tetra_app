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

@WebMvcTest(UserContentProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserContentProgressControllerTestPost {

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
        mockMvc.perform(post("/api/users-content-progress")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer badtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns400IfRequiredFieldsMissing() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(UUID.randomUUID().toString());
        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns400IfInvalidUUIDFormat() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(UUID.randomUUID().toString());
        Map<String, Object> body = new HashMap<>();
        body.put("unitId", "bad-uuid");
        body.put("unitContentId", "bad-uuid");
        body.put("status", "IN_PROGRESS");
        body.put("points", 100);
        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns404IfUserNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.empty());
        Map<String, Object> body = new HashMap<>();
        body.put("unitId", unitId.toString());
        body.put("unitContentId", unitContentId.toString());
        body.put("status", "IN_PROGRESS");
        body.put("points", 100);
        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns404IfUnitNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.empty());
        Map<String, Object> body = new HashMap<>();
        body.put("unitId", unitId.toString());
        body.put("unitContentId", unitContentId.toString());
        body.put("status", "IN_PROGRESS");
        body.put("points", 100);
        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns404IfUnitContentNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(new Unit()));
        Mockito.when(unitContentRepository.findById(unitContentId)).thenReturn(Optional.empty());
        Map<String, Object> body = new HashMap<>();
        body.put("unitId", unitId.toString());
        body.put("unitContentId", unitContentId.toString());
        body.put("status", "IN_PROGRESS");
        body.put("points", 100);
        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns400IfUnitContentDoesNotBelongToUnit() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        Unit unit = new Unit();
        unit.setId(unitId);
        Unit wrongUnit = new Unit();
        wrongUnit.setId(UUID.randomUUID());
        UnitContent unitContent = new UnitContent();
        unitContent.setId(unitContentId);
        unitContent.setUnit(wrongUnit);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        Mockito.when(unitContentRepository.findById(unitContentId)).thenReturn(Optional.of(unitContent));

        Map<String, Object> body = new HashMap<>();
        body.put("unitId", unitId.toString());
        body.put("unitContentId", unitContentId.toString());
        body.put("status", "IN_PROGRESS");
        body.put("points", 100);

        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns409IfProgressAlreadyExists() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(new Unit()));
        UnitContent unitContent = new UnitContent();
        unitContent.setId(unitContentId);
        Unit unit = new Unit();
        unit.setId(unitId);
        unitContent.setUnit(unit);
        Mockito.when(unitContentRepository.findById(unitContentId)).thenReturn(Optional.of(unitContent));
        Mockito.when(userContentProgressRepository.findByUser_IdAndUnitContent_Id(userId, unitContentId))
                .thenReturn(Optional.of(new UserContentProgress()));

        Map<String, Object> body = new HashMap<>();
        body.put("unitId", unitId.toString());
        body.put("unitContentId", unitContentId.toString());
        body.put("status", "IN_PROGRESS");
        body.put("points", 100);

        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    @Test
    void returns201OnSuccess() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        Unit unit = new Unit();
        unit.setId(unitId);
        UnitContent unitContent = new UnitContent();
        unitContent.setId(unitContentId);
        unitContent.setUnit(unit);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        Mockito.when(unitContentRepository.findById(unitContentId)).thenReturn(Optional.of(unitContent));
        Mockito.when(userContentProgressRepository.findByUser_IdAndUnitContent_Id(userId, unitContentId))
                .thenReturn(Optional.empty());
        Mockito.when(userContentProgressRepository.save(any(UserContentProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> body = new HashMap<>();
        body.put("unitId", unitId.toString());
        body.put("unitContentId", unitContentId.toString());
        body.put("status", "COMPLETED");
        body.put("points", 100);

        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void returns400IfStatusIsInvalid() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(new Unit()));
        UnitContent unitContent = new UnitContent();
        unitContent.setId(unitContentId);
        Unit unit = new Unit();
        unit.setId(unitId);
        unitContent.setUnit(unit);
        Mockito.when(unitContentRepository.findById(unitContentId)).thenReturn(Optional.of(unitContent));
        Mockito.when(userContentProgressRepository.findByUser_IdAndUnitContent_Id(userId, unitContentId))
                .thenReturn(Optional.empty());

        Map<String, Object> body = new HashMap<>();
        body.put("unitId", unitId.toString());
        body.put("unitContentId", unitContentId.toString());
        body.put("status", "INVALID_STATUS");
        body.put("points", 100);

        mockMvc.perform(post("/api/users-content-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }
}
