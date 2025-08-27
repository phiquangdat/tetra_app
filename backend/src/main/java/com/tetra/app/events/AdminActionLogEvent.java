package com.tetra.app.events;

import java.util.UUID;

public class AdminActionLogEvent {
    private final UUID adminId;
    private final String actionType;
    private final UUID entityId;
    private final String subjectType;

    public AdminActionLogEvent(UUID adminId, String actionType, UUID entityId, String subjectType) {
        this.adminId = adminId;
        this.actionType = actionType;
        this.entityId = entityId;
        this.subjectType = subjectType;
    }

    public UUID getAdminId() { return adminId; }
    public String getActionType() { return actionType; }
    public UUID getEntityId() { return entityId; }
    public String getSubjectType() { return subjectType; }
}
