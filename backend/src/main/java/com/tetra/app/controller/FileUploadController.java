package com.tetra.app.controller;

import com.tetra.app.model.Attachment;
import com.tetra.app.repository.AttachmentRepository;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.dto.UpdateAttachmentRequest;
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

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import java.util.Optional;
import com.tetra.app.dto.FileDownloadInfoDTO;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import jakarta.validation.Valid;

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

    @GetMapping("/uploads/{id}")
    @Operation(summary = "Download a previously uploaded file by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File returned successfully"),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> getFile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") UUID id
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Missing or invalid Authorization header"));
        }
        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token is blacklisted (logged out)"));
        }
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }

        Optional<Attachment> attachmentOpt = attachmentRepository.findById(id);
        if (attachmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "File not found"));
        }
        Attachment attachment = attachmentOpt.get();
        Path filePath = Paths.get(uploadDir).resolve(attachment.getStoragePath());
        if (!Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "File not found"));
        }
        try {
            InputStreamResource resource = new InputStreamResource(Files.newInputStream(filePath));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getName() + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, attachment.getMime());
            headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(attachment.getSize()));
            FileDownloadInfoDTO dto = new FileDownloadInfoDTO(
                    attachment.getId(),
                    attachment.getName(),
                    attachment.getMime(),
                    attachment.getSize()
            );
            headers.add("X-File-Id", dto.getId().toString());
            headers.add("X-File-Name", dto.getName());
            headers.add("X-File-Mime", dto.getMime());
            headers.add("X-File-Size", String.valueOf(dto.getSize()));
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to read file: " + e.getMessage()));
        }
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token is blacklisted (logged out)");
        }

        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                    .body("File size exceeds maximum limit of 50 MB");
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

    @PutMapping("/uploads/{id}")
    @Operation(summary = "Update attachment metadata")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Attachment updated successfully"),
            @ApiResponse(responseCode = "404", description = "Attachment not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> updateAttachment(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAttachmentRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token is blacklisted (logged out)");
        }
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied");
        }

        Optional<Attachment> attachmentOpt = attachmentRepository.findById(id);
        if (attachmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attachment not found");
        }

        try {
            Attachment attachment = attachmentOpt.get();
            attachment.setName(request.getName());
            attachment.setMime(request.getMime());
            attachment.setSize(request.getSize());

            Attachment updatedAttachment = attachmentRepository.save(attachment);

            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedAttachment.getId().toString());
            response.put("name", updatedAttachment.getName());
            response.put("mime", updatedAttachment.getMime());
            response.put("size", updatedAttachment.getSize());
            response.put("storage_path", updatedAttachment.getStoragePath());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update attachment: " + e.getMessage());
        }
    }

    @DeleteMapping("/uploads/{id}")
    @Operation(summary = "Delete an attachment and its associated file")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Attachment and file deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Attachment not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> deleteAttachment(
            @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token is blacklisted (logged out)");
        }
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied");
        }

        Optional<Attachment> attachmentOpt = attachmentRepository.findById(id);
        if (attachmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Attachment not found");
        }

        try {
            Attachment attachment = attachmentOpt.get();
            String storagePath = attachment.getStoragePath();

            Path filePath = Paths.get(uploadDir).resolve(storagePath);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            attachmentRepository.deleteById(id);

            return ResponseEntity.ok("Attachment and file deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete attachment: " + e.getMessage());
        }
    }
}
