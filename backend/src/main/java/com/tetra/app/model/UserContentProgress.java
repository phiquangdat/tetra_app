package com.tetra.app.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users_content_progress")
public class UserContentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_content_id", nullable = false)
    private UnitContent unitContent;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Integer points = 0;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Unit getUnit() { return unit; }
    public void setUnit(Unit unit) { this.unit = unit; }

    public UnitContent getUnitContent() { return unitContent; }
    public void setUnitContent(UnitContent unitContent) { this.unitContent = unitContent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getPoints() { 
        
        if ("IN_PROGRESS".equals(this.status)) {
            return 0;
        }
        return points; 
    }
    public void setPoints(Integer points) { this.points = points; }
}
