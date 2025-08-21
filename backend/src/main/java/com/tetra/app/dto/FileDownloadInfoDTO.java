package com.tetra.app.dto;

import java.util.UUID;

public class FileDownloadInfoDTO {
    private UUID id;
    private String name;
    private String mime;
    private Integer size;

    public FileDownloadInfoDTO(UUID id, String name, String mime, Integer size) {
        this.id = id;
        this.name = name;
        this.mime = mime;
        this.size = size;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getMime() {
        return mime;
    }

    public Integer getSize() {
        return size;
    }
}
