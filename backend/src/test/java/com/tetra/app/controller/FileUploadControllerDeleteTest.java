package com.tetra.app.controller;

import com.tetra.app.TestSecurityConfig;
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
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FileUploadController.class)
@Import(TestSecurityConfig.class)
public class FileUploadControllerDeleteTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AttachmentRepository attachmentRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    private String validAdminToken;
    private String validLearnerToken;
    private UUID attachmentId;
    private Attachment mockAttachment;

    @BeforeEach
    void setUp() {
        validAdminToken = "valid.admin.jwt.token";
        validLearnerToken = "valid.learner.jwt.token";
        attachmentId = UUID.randomUUID();
        
        mockAttachment = new Attachment();
        mockAttachment.setId(attachmentId);
        mockAttachment.setName("test-file.txt");
        mockAttachment.setMime("text/plain");
        mockAttachment.setSize(1024);
        mockAttachment.setStoragePath("test-uuid.txt");

        when(jwtUtil.extractRole(validAdminToken)).thenReturn("ADMIN");
        when(jwtUtil.extractRole(validLearnerToken)).thenReturn("LEARNER");
        when(blacklistedTokenRepository.existsByToken(anyString())).thenReturn(false);
    }

    @Test
    void testSuccessfulAttachmentDeletion() throws Exception {
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(mockAttachment));
        doNothing().when(attachmentRepository).deleteById(attachmentId);

        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Attachment and file deleted successfully"));

        verify(attachmentRepository).findById(attachmentId);
        verify(attachmentRepository).deleteById(attachmentId);
    }

    @Test
    void testDeleteAttachmentWithoutAuthorization() throws Exception {
        mockMvc.perform(delete("/api/uploads/" + attachmentId))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));

        verify(attachmentRepository, never()).findById(any());
        verify(attachmentRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteAttachmentWithInvalidToken() throws Exception {
        when(jwtUtil.extractRole(anyString())).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));

        verify(attachmentRepository, never()).findById(any());
        verify(attachmentRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteAttachmentWithBlacklistedToken() throws Exception {
        when(blacklistedTokenRepository.existsByToken(validAdminToken)).thenReturn(true);

        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Token is blacklisted (logged out)"));

        verify(attachmentRepository, never()).findById(any());
        verify(attachmentRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteAttachmentWithLearnerRole() throws Exception {
        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", "Bearer " + validLearnerToken))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));

        verify(attachmentRepository, never()).findById(any());
        verify(attachmentRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteNonExistentAttachment() throws Exception {
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Attachment not found"));

        verify(attachmentRepository).findById(attachmentId);
        verify(attachmentRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteAttachmentWithRepositoryException() throws Exception {
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(mockAttachment));
        doThrow(new RuntimeException("Database error")).when(attachmentRepository).deleteById(attachmentId);

        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to delete attachment: Database error"));

        verify(attachmentRepository).findById(attachmentId);
        verify(attachmentRepository).deleteById(attachmentId);
    }

    @Test
    void testDeleteAttachmentWithInvalidUUID() throws Exception {
        String invalidId = "invalid-uuid";

        mockMvc.perform(delete("/api/uploads/" + invalidId)
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isBadRequest());

        verify(attachmentRepository, never()).findById(any());
        verify(attachmentRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteAttachmentWithMissingBearerPrefix() throws Exception {
        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", "valid.admin.jwt.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));

        verify(attachmentRepository, never()).findById(any());
        verify(attachmentRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteAttachmentWithEmptyAuthorizationHeader() throws Exception {
        mockMvc.perform(delete("/api/uploads/" + attachmentId)
                        .header("Authorization", ""))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));

        verify(attachmentRepository, never()).findById(any());
        verify(attachmentRepository, never()).deleteById(any());
    }
}
