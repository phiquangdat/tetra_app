package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.User;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.model.UserContentProgress;
import com.tetra.app.repository.UserContentProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserContentProgressController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserContentProgressControllerTestPut {

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

    private UUID userId;
    private UUID progressId;
    private User user;
    private UserContentProgress progress;

    @BeforeEach
    void setup() {
        userId = UUID.randomUUID();
        progressId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        progress = new UserContentProgress();
        progress.setId(progressId);
        progress.setUser(user);
    }

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer badtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid userId in token"));
    }

    @Test
    void returns404IfProgressNotFound() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findById(progressId)).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Progress not found"));
    }

    @Test
    void returns404IfProgressNotOwnedByUser() throws Exception {
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        progress.setUser(otherUser);
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Progress not found for this user"));
    }

    @Test
    void returns200OnSuccessfulUpdate_status() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        Mockito.when(userContentProgressRepository.save(any(UserContentProgress.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> body = new HashMap<>();
        body.put("status", "COMPLETED");

        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void returns200OnSuccessfulUpdate_points() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        Mockito.when(userContentProgressRepository.save(any(UserContentProgress.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> body = new HashMap<>();
        body.put("points", 123);

        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void returns400IfInvalidStatus() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        Map<String, Object> body = new HashMap<>();
        body.put("status", "INVALID_STATUS");

        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid status value. Allowed: IN_PROGRESS, COMPLETED"));
    }

    @Test
    void returns400IfInvalidPointsFormat() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        Map<String, Object> body = new HashMap<>();
        body.put("points", "not-a-number");

        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid points format"));
    }

    @Test
    void returns400IfNoUpdatableFieldsProvided() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        mockMvc.perform(put("/api/users-content-progress/" + progressId)
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("No updatable fields provided"));
    }
}
