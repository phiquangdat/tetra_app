package com.tetra.app.controller;

import com.tetra.app.model.ProgressStatus;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.repository.UserModuleProgressRepository;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UserRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserModuleProgressControllerGetListTest {

    private UserModuleProgressController controller;
    private UserModuleProgressRepository progressRepo;
    private TrainingModuleRepository moduleRepo;
    private UserRepository userRepo;
    private UnitRepository unitRepo;
    private UnitContentRepository contentRepo;
    private JwtUtil jwtUtil;

    private final String token = "Bearer test.jwt.token";
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setup() {
        progressRepo = mock(UserModuleProgressRepository.class);
        moduleRepo = mock(TrainingModuleRepository.class);
        userRepo = mock(UserRepository.class);
        unitRepo = mock(UnitRepository.class);
        contentRepo = mock(UnitContentRepository.class);
        jwtUtil = mock(JwtUtil.class);

        controller = new UserModuleProgressController(
            progressRepo, moduleRepo, userRepo, jwtUtil, unitRepo, contentRepo
        );

        when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
    }

    private UserModuleProgress createProgress(String moduleTitle, int earnedPoints, ProgressStatus status) {
        UserModuleProgress progress = new UserModuleProgress();
        progress.setId(UUID.randomUUID());

        TrainingModule module = new TrainingModule();
        module.setId(UUID.randomUUID());
        module.setTitle(moduleTitle);

        progress.setModule(module);
        progress.setStatus(status);
        progress.setEarnedPoints(earnedPoints);

        // Add lastVisitedUnit and lastVisitedContent to avoid NPE
        var unit = mock(com.tetra.app.model.Unit.class);
        var content = mock(com.tetra.app.model.UnitContent.class);
        UUID unitId = UUID.randomUUID();
        UUID contentId = UUID.randomUUID();
        when(unit.getId()).thenReturn(unitId);
        when(content.getId()).thenReturn(contentId);

        progress.setLastVisitedUnit(unit);
        progress.setLastVisitedContent(content);

        return progress;
    }

    @Test
    void testGetUserModuleProgressList_noAuthHeader() {
        ResponseEntity<?> resp = controller.getUserModuleProgressList(null, null, null);
        assertEquals(401, resp.getStatusCodeValue());
    }

    @Test
    void testGetUserModuleProgressList_invalidToken() {
        when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("Invalid token"));
        ResponseEntity<?> resp = controller.getUserModuleProgressList(token, null, null);
        assertEquals(401, resp.getStatusCodeValue());
    }

    @Test
    void testGetUserModuleProgressList_statusFilterAndLimit() {
        UserModuleProgress progress1 = createProgress("Module 1", 10, ProgressStatus.IN_PROGRESS);
        UserModuleProgress progress2 = createProgress("Module 2", 20, ProgressStatus.IN_PROGRESS);

        when(progressRepo.findByUser_IdAndStatus(eq(userId), eq(ProgressStatus.IN_PROGRESS)))
            .thenReturn(List.of(progress1, progress2));

        ResponseEntity<?> resp = controller.getUserModuleProgressList(token, "in_progress", 1);
        assertEquals(200, resp.getStatusCodeValue());

        List<?> result = (List<?>) resp.getBody();
        assertNotNull(result);
        assertEquals(1, result.size());

        Map<?, ?> item = (Map<?, ?>) result.get(0);
        assertNotNull(item);
        assertEquals(progress1.getModule().getId(), item.get("moduleId"));
        assertEquals("Module 1", item.get("moduleTitle"));
        assertEquals(ProgressStatus.IN_PROGRESS, item.get("status"));
        assertEquals(10, item.get("earned_points"));
    }

    @Test
    void testGetUserModuleProgressList_invalidStatus() {
        ResponseEntity<?> resp = controller.getUserModuleProgressList(token, "not_a_status", null);
        assertEquals(400, resp.getStatusCodeValue());
    }

    @Test
    void testGetUserModuleProgressList_noFilter() {
        UserModuleProgress progress = createProgress("Module X", 5, ProgressStatus.IN_PROGRESS);

        when(progressRepo.findByUser_Id(eq(userId))).thenReturn(List.of(progress));

        ResponseEntity<?> resp = controller.getUserModuleProgressList(token, null, null);
        assertEquals(200, resp.getStatusCodeValue());

        List<?> result = (List<?>) resp.getBody();
        assertNotNull(result);
        assertEquals(1, result.size());

        Map<?, ?> item = (Map<?, ?>) result.get(0);
        assertNotNull(item);
        assertEquals(progress.getModule().getId(), item.get("moduleId"));
        assertEquals("Module X", item.get("moduleTitle"));
        assertEquals(ProgressStatus.IN_PROGRESS, item.get("status"));
        assertEquals(5, item.get("earned_points"));
    }
}
