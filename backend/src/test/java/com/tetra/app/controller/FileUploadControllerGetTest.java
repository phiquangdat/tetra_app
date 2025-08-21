package com.tetra.app.controller;

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

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FileUploadController.class)
@Import(com.tetra.app.TestSecurityConfig.class)
public class FileUploadControllerGetTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AttachmentRepository attachmentRepository;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    private String validToken;
    private UUID userId;
    private Attachment mockAttachment;

    @BeforeEach
    void setUp() {
        validToken = "valid.jwt.token";
        userId = UUID.randomUUID();
        mockAttachment = new Attachment();
        mockAttachment.setId(UUID.randomUUID());
        mockAttachment.setName("test-file.txt");
        mockAttachment.setMime("text/plain");
        mockAttachment.setSize(12);
        mockAttachment.setStoragePath("test-uuid.txt");

        when(jwtUtil.extractUserId(validToken)).thenReturn(userId.toString());
        when(blacklistedTokenRepository.existsByToken(validToken)).thenReturn(false);
    }

    @Test
    void testGetFileSuccess() throws Exception {
        when(attachmentRepository.findById(mockAttachment.getId())).thenReturn(java.util.Optional.of(mockAttachment));
        java.nio.file.Path filePath = java.nio.file.Paths.get("uploads").resolve(mockAttachment.getStoragePath());
        java.nio.file.Files.createDirectories(filePath.getParent());
        java.nio.file.Files.write(filePath, "test content".getBytes());

        mockMvc.perform(get("/api/uploads/" + mockAttachment.getId())
                .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(header().string("X-File-Id", mockAttachment.getId().toString()))
                .andExpect(header().string("X-File-Name", mockAttachment.getName()))
                .andExpect(header().string("X-File-Mime", mockAttachment.getMime()))
                .andExpect(header().string("X-File-Size", String.valueOf(mockAttachment.getSize())))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(mockAttachment.getName())))
                .andExpect(content().bytes("test content".getBytes()));

        java.nio.file.Files.deleteIfExists(filePath);
    }

    @Test
    void testGetFileNotFound() throws Exception {
        when(attachmentRepository.findById(any(UUID.class))).thenReturn(java.util.Optional.empty());
        mockMvc.perform(get("/api/uploads/" + UUID.randomUUID())
                .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("File not found"));
    }

    @Test
    void testGetFileUnauthorized() throws Exception {
        mockMvc.perform(get("/api/uploads/" + mockAttachment.getId()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Missing or invalid Authorization header"));
    }

    @Test
    void testGetFileBlacklistedToken() throws Exception {
        when(blacklistedTokenRepository.existsByToken(validToken)).thenReturn(true);
        mockMvc.perform(get("/api/uploads/" + mockAttachment.getId())
                .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Token is blacklisted (logged out)"));
    }

    @Test
    void testGetFileInvalidToken() throws Exception {
        when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("Invalid token"));
        mockMvc.perform(get("/api/uploads/" + mockAttachment.getId())
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid token"));
    }
}
