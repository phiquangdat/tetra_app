
package com.tetra.app.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "unit_content_id")
    private UUID unitContentId;

    @Column(name = "unit_id")
    private UUID unitId;

    @Column(name = "module_id")
    private UUID moduleId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getUnitContentId() { return unitContentId; }
    public void setUnitContentId(UUID unitContentId) { this.unitContentId = unitContentId; }

    public UUID getUnitId() { return unitId; }
    public void setUnitId(UUID unitId) { this.unitId = unitId; }

    public UUID getModuleId() { return moduleId; }
    public void setModuleId(UUID moduleId) { this.moduleId = moduleId; }

    @Override
    public String toString() {
        return "Subject{" +
                "id=" + getId() +
                ", userId=" + getUserId() +
                ", unitContentId=" + getUnitContentId() +
                ", unitId=" + getUnitId() +
                ", moduleId=" + getModuleId() +
                '}';
    }
}