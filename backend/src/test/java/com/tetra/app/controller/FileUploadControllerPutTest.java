package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.TestSecurityConfig;
import com.tetra.app.dto.UpdateAttachmentRequest;
import com.tetra.app.model.Attachment;
import com.tetra.app.repository.AttachmentRepository;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FileUploadController.class)
@Import(TestSecurityConfig.class)
public class FileUploadControllerPutTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AttachmentRepository attachmentRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String validAdminToken;
    private String validLearnerToken;
    private UUID attachmentId;
    private Attachment mockAttachment;
    private UpdateAttachmentRequest updateRequest;

    @BeforeEach
    void setUp() {
        validAdminToken = "valid.admin.jwt.token";
        validLearnerToken = "valid.learner.jwt.token";
        attachmentId = UUID.randomUUID();
        
        mockAttachment = new Attachment();
        mockAttachment.setId(attachmentId);
        mockAttachment.setName("original-file.txt");
        mockAttachment.setMime("text/plain");
        mockAttachment.setSize(1024);
        mockAttachment.setStoragePath("original-uuid.txt");

        updateRequest = new UpdateAttachmentRequest();
        updateRequest.setName("updated-file.txt");
        updateRequest.setMime("text/plain");
        updateRequest.setSize(2048);

        when(jwtUtil.extractRole(validAdminToken)).thenReturn("ADMIN");
        when(jwtUtil.extractRole(validLearnerToken)).thenReturn("LEARNER");
        when(blacklistedTokenRepository.existsByToken(anyString())).thenReturn(false);
    }

    @Test
    void testSuccessfulAttachmentUpdate() throws Exception {
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(mockAttachment));
        when(attachmentRepository.save(any(Attachment.class))).thenReturn(mockAttachment);

        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(attachmentId.toString()))
                .andExpect(jsonPath("$.name").value("updated-file.txt"))
                .andExpect(jsonPath("$.mime").value("text/plain"))
                .andExpect(jsonPath("$.size").value(2048))
                .andExpect(jsonPath("$.storage_path").value("original-uuid.txt"));
    }

    @Test
    void testUpdateAttachmentWithoutAuthorization() throws Exception {
        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void testUpdateAttachmentWithInvalidToken() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void testUpdateAttachmentWithBlacklistedToken() throws Exception {
        when(blacklistedTokenRepository.existsByToken(validAdminToken)).thenReturn(true);

        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Token is blacklisted (logged out)"));
    }

    @Test
    void testUpdateAttachmentWithLearnerRole() throws Exception {
        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .header("Authorization", "Bearer " + validLearnerToken))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    void testUpdateNonExistentAttachment() throws Exception {
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Attachment not found"));
    }

    @Test
    void testUpdateAttachmentWithInvalidRequest() throws Exception {
        UpdateAttachmentRequest invalidRequest = new UpdateAttachmentRequest();
        invalidRequest.setName(""); // Empty name should fail validation
        invalidRequest.setMime("text/plain");
        invalidRequest.setSize(1024);

        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest))
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateAttachmentWithNullValues() throws Exception {
        UpdateAttachmentRequest nullRequest = new UpdateAttachmentRequest();
        // All fields are null, which should fail validation

        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nullRequest))
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateAttachmentWithRepositoryException() throws Exception {
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(mockAttachment));
        when(attachmentRepository.save(any(Attachment.class))).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(put("/api/uploads/" + attachmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to update attachment: Database error"));
    }
}
