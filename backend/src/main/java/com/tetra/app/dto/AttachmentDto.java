package com.tetra.app.dto;

import java.util.UUID;

public class AttachmentDto {
    private UUID id;
    private String name;
    private String mime;
    private Integer size;
    private String storagePath;

    public AttachmentDto() {
    }

    public AttachmentDto(UUID id, String name, String mime, Integer size, String storagePath) {
        this.id = id;
        this.name = name;
        this.mime = mime;
        this.size = size;
        this.storagePath = storagePath;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }
}
