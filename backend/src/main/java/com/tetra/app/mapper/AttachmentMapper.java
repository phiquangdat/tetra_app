package com.tetra.app.mapper;

import com.tetra.app.dto.AttachmentDto;
import com.tetra.app.model.Attachment;
import org.springframework.stereotype.Component;

@Component
public class AttachmentMapper {

    public AttachmentDto toDto(Attachment attachment) {
        if (attachment == null) {
            return null;
        }
        
        return new AttachmentDto(
                attachment.getId(),
                attachment.getName(),
                attachment.getMime(),
                attachment.getSize(),
                attachment.getStoragePath()
        );
    }

    public Attachment toEntity(AttachmentDto attachmentDto) {
        if (attachmentDto == null) {
            return null;
        }
        
        Attachment attachment = new Attachment();
        attachment.setId(attachmentDto.getId());
        attachment.setName(attachmentDto.getName());
        attachment.setMime(attachmentDto.getMime());
        attachment.setSize(attachmentDto.getSize());
        attachment.setStoragePath(attachmentDto.getStoragePath());
        
        return attachment;
    }
}
