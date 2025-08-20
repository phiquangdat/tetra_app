package com.tetra.app.controller;

import com.tetra.app.model.Attachment;
import com.tetra.app.repository.AttachmentRepository;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final AttachmentRepository attachmentRepository;
    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    public FileUploadController(
            AttachmentRepository attachmentRepository,
            JwtUtil jwtUtil,
            BlacklistedTokenRepository blacklistedTokenRepository
    ) {
        this.attachmentRepository = attachmentRepository;
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file and save metadata")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "File uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> uploadFile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Parameter(description = "File to upload", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        
        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is blacklisted (logged out)");
        }
        
        try {
            jwtUtil.extractUserId(token); 
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }

        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body("File size exceeds maximum limit of 50 MB");
        }

        try {
            
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);

            
            Attachment attachment = new Attachment();
            attachment.setName(originalFilename != null ? originalFilename : "unknown");
            attachment.setMime(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
            attachment.setSize((int) file.getSize());
            attachment.setStoragePath(uniqueFilename);

            Attachment savedAttachment = attachmentRepository.save(attachment);

            
            Map<String, Object> response = new HashMap<>();
            response.put("file_id", savedAttachment.getId().toString());
            response.put("original_name", savedAttachment.getName());
            response.put("mime", savedAttachment.getMime());
            response.put("size", savedAttachment.getSize());
            response.put("storage_path", savedAttachment.getStoragePath());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }
}
