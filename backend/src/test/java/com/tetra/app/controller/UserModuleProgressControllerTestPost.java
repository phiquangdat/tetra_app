package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.TestSecurityConfig;
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

@WebMvcTest(UserModuleProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(TestSecurityConfig.class)
public class UserModuleProgressControllerTestPost {

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
    void contextLoads() {
    }

    @Test
    void returns401IfNoAuthHeader() throws Exception {
        mockMvc.perform(post("/api/user-module-progress")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns401IfInvalidToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("bad token"));
        mockMvc.perform(post("/api/user-module-progress")
                .header("Authorization", "Bearer badtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void returns400IfInvalidUserIdInToken() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn("not-a-uuid");
        mockMvc.perform(post("/api/user-module-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns400IfModuleIdMissing() throws Exception {
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(UUID.randomUUID().toString());
        mockMvc.perform(post("/api/user-module-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createsProgressWithDefaultFirstUnitAndContent_singleUnitSingleContent() throws Exception {
                UUID userId = UUID.randomUUID();
                UUID moduleId = UUID.randomUUID();
                UUID unitId = UUID.randomUUID();
                UUID contentId = UUID.randomUUID();

                User user = new User();
                user.setId(userId);
                TrainingModule module = new TrainingModule();
                module.setId(moduleId);
                Unit unit = new Unit();
                unit.setId(unitId);
                unit.setModule(module);
                unit.setSortOrder(1);
                UnitContent content = new UnitContent();
                content.setId(contentId);
                content.setUnit(unit);
                content.setSortOrder(1);

                Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
                Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId)).thenReturn(Optional.empty());
                Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
                Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
                Mockito.when(unitRepository.findByModule_Id(moduleId)).thenReturn(List.of(unit));
                Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(List.of(content));
                Mockito.when(userModuleProgressRepository.save(any(UserModuleProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));

                Map<String, String> body = new HashMap<>();
                body.put("moduleId", moduleId.toString());

                mockMvc.perform(post("/api/user-module-progress")
                                .header("Authorization", "Bearer sometoken")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                                .andExpect(status().isCreated())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

                @Test
                void createsProgressWithDefaultFirstUnitAndContent_multipleUnitsSortOrder() throws Exception {
                        UUID userId = UUID.randomUUID();
                        UUID moduleId = UUID.randomUUID();
                        UUID unitId1 = UUID.randomUUID();
                        UUID unitId2 = UUID.randomUUID();
                        UUID contentId1 = UUID.randomUUID();
                        UUID contentId2 = UUID.randomUUID();

                        User user = new User();
                        user.setId(userId);
                        TrainingModule module = new TrainingModule();
                        module.setId(moduleId);
                        Unit unit1 = new Unit();
                        unit1.setId(unitId1);
                        unit1.setModule(module);
                        unit1.setSortOrder(1);
                        Unit unit2 = new Unit();
                        unit2.setId(unitId2);
                        unit2.setModule(module);
                        unit2.setSortOrder(2);
                        UnitContent content1 = new UnitContent();
                        content1.setId(contentId1);
                        content1.setUnit(unit1);
                        content1.setSortOrder(1);
                        UnitContent content2 = new UnitContent();
                        content2.setId(contentId2);
                        content2.setUnit(unit2);
                        content2.setSortOrder(1);

                        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
                        Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId)).thenReturn(Optional.empty());
                        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
                        Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
                        Mockito.when(unitRepository.findByModule_Id(moduleId)).thenReturn(List.of(unit2, unit1)); // Unsorted input
                        Mockito.when(unitContentRepository.findByUnit_Id(unitId1)).thenReturn(List.of(content1));
                        Mockito.when(unitContentRepository.findByUnit_Id(unitId2)).thenReturn(List.of(content2));
                        Mockito.when(userModuleProgressRepository.save(any(UserModuleProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));

                        Map<String, String> body = new HashMap<>();
                        body.put("moduleId", moduleId.toString());

                        // Проверяем, что выбрана unit1 и content1 (первая по sortOrder)
                        mockMvc.perform(post("/api/user-module-progress")
                                        .header("Authorization", "Bearer sometoken")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(body)))
                                        .andExpect(status().isCreated())
                                        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
                }

        @Test
        void returns400IfUnitHasNoContent() throws Exception {
                UUID userId = UUID.randomUUID();
                UUID moduleId = UUID.randomUUID();
                UUID unitId = UUID.randomUUID();

                User user = new User();
                user.setId(userId);
                TrainingModule module = new TrainingModule();
                module.setId(moduleId);
                Unit unit = new Unit();
                unit.setId(unitId);
                unit.setModule(module);
                unit.setSortOrder(1);

                Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
                Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId)).thenReturn(Optional.empty());
                Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
                Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
                Mockito.when(unitRepository.findByModule_Id(moduleId)).thenReturn(List.of(unit));
                Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(List.of());

                Map<String, String> body = new HashMap<>();
                body.put("moduleId", moduleId.toString());

                mockMvc.perform(post("/api/user-module-progress")
                                .header("Authorization", "Bearer sometoken")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void returns400IfModuleHasNoUnits() throws Exception {
                UUID userId = UUID.randomUUID();
                UUID moduleId = UUID.randomUUID();

                User user = new User();
                user.setId(userId);
                TrainingModule module = new TrainingModule();
                module.setId(moduleId);

                Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
                Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId)).thenReturn(Optional.empty());
                Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
                Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
                Mockito.when(unitRepository.findByModule_Id(moduleId)).thenReturn(List.of());

                Map<String, String> body = new HashMap<>();
                body.put("moduleId", moduleId.toString());

                mockMvc.perform(post("/api/user-module-progress")
                                .header("Authorization", "Bearer sometoken")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void usesExplicitUnitAndContentIfProvided() throws Exception {
                UUID userId = UUID.randomUUID();
                UUID moduleId = UUID.randomUUID();
                UUID unitId = UUID.randomUUID();
                UUID contentId = UUID.randomUUID();

                User user = new User();
                user.setId(userId);
                TrainingModule module = new TrainingModule();
                module.setId(moduleId);
                Unit unit = new Unit();
                unit.setId(unitId);
                unit.setModule(module);
                UnitContent content = new UnitContent();
                content.setId(contentId);
                content.setUnit(unit);

                Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
                Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId)).thenReturn(Optional.empty());
                Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
                Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
                Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
                Mockito.when(unitRepository.findByModule_Id(moduleId)).thenReturn(List.of(unit));
                Mockito.when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(content));
                Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(List.of(content));
                Mockito.when(userModuleProgressRepository.save(any(UserModuleProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));

                Map<String, String> body = new HashMap<>();
                body.put("moduleId", moduleId.toString());
                body.put("lastVisitedUnitId", unitId.toString());
                body.put("lastVisitedContent", contentId.toString());

                mockMvc.perform(post("/api/user-module-progress")
                                .header("Authorization", "Bearer sometoken")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                                .andExpect(status().isCreated())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
        }

    @Test
    void returns404IfUserNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.empty());
        mockMvc.perform(post("/api/user-module-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"moduleId\":\"" + moduleId + "\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns404IfModuleNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.empty());
        mockMvc.perform(post("/api/user-module-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"moduleId\":\"" + moduleId + "\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns409IfProgressAlreadyExists() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId))
                .thenReturn(Optional.of(new UserModuleProgress()));
        mockMvc.perform(post("/api/user-module-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"moduleId\":\"" + moduleId + "\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void returns201OnSuccess() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID moduleId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UUID contentId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        TrainingModule module = new TrainingModule();
        module.setId(moduleId);
        Unit unit = new Unit();
        unit.setId(unitId);
        unit.setModule(module);
        UnitContent content = new UnitContent();
        content.setId(contentId);
        content.setUnit(unit);

        Mockito.when(jwtUtil.extractUserId(anyString())).thenReturn(userId.toString());
        Mockito.when(userModuleProgressRepository.findByUser_IdAndModule_Id(userId, moduleId))
                .thenReturn(Optional.empty());
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        Mockito.when(unitRepository.findByModule_Id(moduleId)).thenReturn(List.of(unit));
        Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(List.of(content));
        Mockito.when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(content));
        Mockito.when(userModuleProgressRepository.save(any(UserModuleProgress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, String> body = new HashMap<>();
        body.put("moduleId", moduleId.toString());
        body.put("lastVisitedUnitId", unitId.toString());
        body.put("lastVisitedContent", contentId.toString());

        mockMvc.perform(post("/api/user-module-progress")
                .header("Authorization", "Bearer sometoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }
}
