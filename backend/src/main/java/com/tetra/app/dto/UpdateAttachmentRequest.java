package com.tetra.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateAttachmentRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "MIME type is required")
    private String mime;
    
    @NotNull(message = "Size is required")
    private Integer size;

    public UpdateAttachmentRequest() {
    }

    public UpdateAttachmentRequest(String name, String mime, Integer size) {
        this.name = name;
        this.mime = mime;
        this.size = size;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMime() {
        return mime;
    }

    public void setMime(String mime) {
        this.mime = mime;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }
}
