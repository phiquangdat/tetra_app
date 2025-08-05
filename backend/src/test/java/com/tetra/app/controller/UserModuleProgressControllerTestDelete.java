package com.tetra.app.controller;

import com.tetra.app.model.User;
import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.repository.UserModuleProgressRepository;
import com.tetra.app.repository.TrainingModuleRepository;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserModuleProgressController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class UserModuleProgressControllerTestDelete {

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

    private UUID progressId;
    private UUID userId;
    private User user;
    private UserModuleProgress progress;

    @BeforeEach
    void setup() {
        progressId = UUID.randomUUID();
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        progress = new UserModuleProgress();
        progress.setId(progressId);
        progress.setUser(user);
    }

    @Test
    void deleteUserModuleProgress_success_owner() throws Exception {
        Mockito.when(jwtUtil.extractUserId("validtoken")).thenReturn(userId.toString());
        Mockito.when(jwtUtil.extractRole("validtoken")).thenReturn("LEARNER");
        Mockito.when(userModuleProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        mockMvc.perform(delete("/api/user-module-progress/" + progressId)
                .header("Authorization", "Bearer validtoken"))
                .andExpect(status().isOk())
                .andExpect(content().string("User module progress deleted"));
    }

    @Test
    void deleteUserModuleProgress_success_admin() throws Exception {
        Mockito.when(jwtUtil.extractUserId("adminid")).thenReturn(UUID.randomUUID().toString());
        Mockito.when(jwtUtil.extractRole("adminid")).thenReturn("ADMIN");
        Mockito.when(userModuleProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        mockMvc.perform(delete("/api/user-module-progress/" + progressId)
                .header("Authorization", "Bearer adminid"))
                .andExpect(status().isOk())
                .andExpect(content().string("User module progress deleted"));
    }

    @Test
    void deleteUserModuleProgress_unauthorized_missingHeader() throws Exception {
        mockMvc.perform(delete("/api/user-module-progress/" + progressId))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void deleteUserModuleProgress_unauthorized_invalidToken() throws Exception {
        Mockito.doThrow(new RuntimeException("Invalid token")).when(jwtUtil).extractUserId("badtoken");

        mockMvc.perform(delete("/api/user-module-progress/" + progressId)
                .header("Authorization", "Bearer badtoken"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void deleteUserModuleProgress_forbidden_notOwnerOrAdmin() throws Exception {
        UUID anotherUserId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId("othertoken")).thenReturn(anotherUserId.toString());
        Mockito.when(jwtUtil.extractRole("othertoken")).thenReturn("LEARNER");
        Mockito.when(userModuleProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        mockMvc.perform(delete("/api/user-module-progress/" + progressId)
                .header("Authorization", "Bearer othertoken"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    void deleteUserModuleProgress_notFound() throws Exception {
        Mockito.when(jwtUtil.extractUserId("validtoken")).thenReturn(userId.toString());
        Mockito.when(jwtUtil.extractRole("validtoken")).thenReturn("LEARNER");
        Mockito.when(userModuleProgressRepository.findById(progressId)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/user-module-progress/" + progressId)
                .header("Authorization", "Bearer validtoken"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("User module progress not found"));
    }

    @Test
    void deleteUserModuleProgress_invalidUserIdInToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId("badusertoken")).thenReturn("not-a-uuid");
        Mockito.when(jwtUtil.extractRole("badusertoken")).thenReturn("LEARNER");

        mockMvc.perform(delete("/api/user-module-progress/" + progressId)
                .header("Authorization", "Bearer badusertoken"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid userId in token"));
    }
}
