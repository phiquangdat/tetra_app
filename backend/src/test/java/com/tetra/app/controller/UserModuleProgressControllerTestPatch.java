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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserModuleProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(com.tetra.app.TestSecurityConfig.class)
public class UserModuleProgressControllerTestPatch {

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

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        mockMvc.perform(patch("/api/user-module-progress/" + UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(patch("/api/user-module-progress/" + UUID.randomUUID())
                        .header("Authorization", "Bearer badtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(patch("/api/user-module-progress/" + UUID.randomUUID())
                        .header("Authorization", "Bearer sometoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns404IfProgressNotFound() throws Exception {
        UUID progressId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userModuleProgressRepository.findById(progressId)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/user-module-progress/" + progressId)
                        .header("Authorization", "Bearer sometoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns403IfProgressNotOwnedByUser() throws Exception {
        UUID progressId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        User otherUser = new User();
        otherUser.setId(otherUserId);

        UserModuleProgress progress = new UserModuleProgress();
        progress.setUser(otherUser);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userModuleProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        mockMvc.perform(patch("/api/user-module-progress/" + progressId)
                        .header("Authorization", "Bearer sometoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void returns200OnSuccessfulUpdate() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID progressId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID contentId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);

        TrainingModule module = new TrainingModule();
        module.setId(UUID.randomUUID());

        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setModule(module);

        UnitContent content = new UnitContent();
        content.setId(contentId);
        content.setUnit(unit);

        UserModuleProgress progress = new UserModuleProgress();
        progress.setId(progressId);
        progress.setUser(user);
        progress.setModule(module);

        Map<String, Object> updates = new HashMap<>();
        updates.put("lastVisitedUnitId", unitId.toString());
        updates.put("lastVisitedContentId", contentId.toString());
        updates.put("status", "IN_PROGRESS");
        updates.put("earnedPoints", 5);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userModuleProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        Mockito.when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(content));
        Mockito.when(userModuleProgressRepository.save(any(UserModuleProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(patch("/api/user-module-progress/" + progressId)
                        .header("Authorization", "Bearer sometoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}