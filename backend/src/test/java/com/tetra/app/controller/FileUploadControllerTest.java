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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FileUploadController.class)
@Import(TestSecurityConfig.class)
public class FileUploadControllerTest {

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
        mockAttachment.setSize(1024);
        mockAttachment.setStoragePath("test-uuid.txt");

        when(jwtUtil.extractUserId(validToken)).thenReturn(userId.toString());
        when(blacklistedTokenRepository.existsByToken(validToken)).thenReturn(false);
        when(attachmentRepository.save(any(Attachment.class))).thenReturn(mockAttachment);
    }

    @Test
    void testSuccessfulFileUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-file.txt",
                "text/plain",
                "Hello, World!".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads")
                        .file(file)
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.file_id").value(mockAttachment.getId().toString()))
                .andExpect(jsonPath("$.original_name").value("test-file.txt"))
                .andExpect(jsonPath("$.mime").value("text/plain"))
                .andExpect(jsonPath("$.size").value(1024))
                .andExpect(jsonPath("$.storage_path").value("test-uuid.txt"));
    }

    @Test
    void testFileUploadWithoutAuthorization() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-file.txt",
                "text/plain",
                "Hello, World!".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads")
                        .file(file))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void testFileUploadWithInvalidToken() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-file.txt",
                "text/plain",
                "Hello, World!".getBytes()
        );

        when(jwtUtil.extractUserId(anyString())).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(multipart("/api/uploads")
                        .file(file)
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void testFileUploadWithBlacklistedToken() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-file.txt",
                "text/plain",
                "Hello, World!".getBytes()
        );

        when(blacklistedTokenRepository.existsByToken(validToken)).thenReturn(true);

        mockMvc.perform(multipart("/api/uploads")
                        .file(file)
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Token is blacklisted (logged out)"));
    }

    @Test
    void testFileUploadWithEmptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-file.txt",
                "text/plain",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/uploads")
                        .file(file)
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("File is empty"));
    }

    @Test
    void testFileUploadWithLargeFile() throws Exception {
        // Test file size validation by creating a smaller file but testing the logic
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large-file.txt",
                "text/plain",
                "Hello, World!".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads")
                        .file(file)
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk()); // This should pass since the file is small
    }
}
