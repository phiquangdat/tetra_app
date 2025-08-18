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
    private Long userId;

    @Column(name = "unit_content_id")
    private Long unitContentId;

    @Column(name = "unit_id")
    private Long unitId;

    @Column(name = "module_id")
    private UUID moduleId;

    @Column(name = "subject_type", nullable = false)
    private String subjectType;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getUnitContentId() { return unitContentId; }
    public void setUnitContentId(Long unitContentId) { this.unitContentId = unitContentId; }

    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }

    public UUID getModuleId() { return moduleId; }
    public void setModuleId(UUID moduleId) { this.moduleId = moduleId; }

    public String getSubjectType() { return subjectType; }
    public void setSubjectType(String subjectType) { this.subjectType = subjectType; }

    @Override
    public String toString() {
        return "Subject{" +
                "id=" + getId() +
                ", userId=" + getUserId() +
                ", unitContentId=" + getUnitContentId() +
                ", unitId=" + getUnitId() +
                ", moduleId=" + getModuleId() +
                ", subjectType='" + getSubjectType() + '\'' +
                '}';
    }
}