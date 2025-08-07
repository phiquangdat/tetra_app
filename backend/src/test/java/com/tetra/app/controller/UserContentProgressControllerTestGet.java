package com.tetra.app.controller;

import com.tetra.app.model.User;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.model.UserContentProgress;
import com.tetra.app.repository.UserContentProgressRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserContentProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
@SuppressWarnings("removal")
public class UserContentProgressControllerTestGet {

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

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        UUID unitContentId = UUID.randomUUID();
        mockMvc.perform(get("/api/users-content-progress/" + unitContentId))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing or invalid Authorization header"));
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        UUID unitContentId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(get("/api/users-content-progress/" + unitContentId)
                .header("Authorization", "Bearer badtoken"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid token"));
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        UUID unitContentId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(get("/api/users-content-progress/" + unitContentId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid userId in token"));
    }

    @Test
    void returns404IfProgressNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findByUser_IdAndUnitContent_Id(userId, unitContentId))
                .thenReturn(Optional.empty());
        mockMvc.perform(get("/api/users-content-progress/" + unitContentId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User content progress not found"));
    }

    @Test
    void returns200AndProgressDataOnSuccess() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID unitContentId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        Unit unit = new Unit();
        unit.setId(unitId);
        UnitContent unitContent = new UnitContent();
        unitContent.setId(unitContentId);

        UserContentProgress progress = new UserContentProgress();
        progress.setId(UUID.randomUUID());
        progress.setUser(user);
        progress.setUnit(unit);
        progress.setUnitContent(unitContent);
        progress.setStatus("COMPLETED");
        progress.setPoints(100);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userContentProgressRepository.findByUser_IdAndUnitContent_Id(userId, unitContentId))
                .thenReturn(Optional.of(progress));

        mockMvc.perform(get("/api/users-content-progress/" + unitContentId)
                .header("Authorization", "Bearer sometoken"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.points").value(100))
                .andExpect(jsonPath("$.unit_id").value(unitId.toString()))
                .andExpect(jsonPath("$.unit_content_id").value(unitContentId.toString()))
                .andExpect(jsonPath("$.user_id").value(userId.toString()));
    }
}
