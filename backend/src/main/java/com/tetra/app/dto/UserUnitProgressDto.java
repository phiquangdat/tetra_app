package com.tetra.app.dto;

import java.util.UUID;

public class UserUnitProgressDto {
    private UUID id;
    private UUID userId;
    private UUID moduleId;
    private UUID unitId;
    private String status;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getModuleId() { return moduleId; }
    public void setModuleId(UUID moduleId) { this.moduleId = moduleId; }

    public UUID getUnitId() { return unitId; }
    public void setUnitId(UUID unitId) { this.unitId = unitId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
