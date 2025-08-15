package com.tetra.app.service;

import com.tetra.app.dto.AttachmentDto;
import com.tetra.app.mapper.AttachmentMapper;
import com.tetra.app.model.Attachment;
import com.tetra.app.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final AttachmentMapper attachmentMapper;

    @Autowired
    public AttachmentService(AttachmentRepository attachmentRepository, AttachmentMapper attachmentMapper) {
        this.attachmentRepository = attachmentRepository;
        this.attachmentMapper = attachmentMapper;
    }

    public List<AttachmentDto> getAllAttachments() {
        return attachmentRepository.findAll()
                .stream()
                .map(attachmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<AttachmentDto> getAttachmentById(UUID id) {
        return attachmentRepository.findById(id)
                .map(attachmentMapper::toDto);
    }

    public AttachmentDto saveAttachment(AttachmentDto attachmentDto) {
        Attachment attachment = attachmentMapper.toEntity(attachmentDto);
        Attachment savedAttachment = attachmentRepository.save(attachment);
        return attachmentMapper.toDto(savedAttachment);
    }

    public void deleteAttachment(UUID id) {
        attachmentRepository.deleteById(id);
    }

    public boolean existsById(UUID id) {
        return attachmentRepository.existsById(id);
    }
}
