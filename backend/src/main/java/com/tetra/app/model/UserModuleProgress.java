package com.tetra.app.model;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "user_module_progress")
public class UserModuleProgress {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private TrainingModule module;

    @ManyToOne
    @JoinColumn(name = "last_visited_unit_id")
    private Unit lastVisitedUnit;

    @ManyToOne
    @JoinColumn(name = "last_visited_content_id")
    private UnitContent lastVisitedContent;

    @Enumerated(EnumType.STRING)
    @NotNull
    private ProgressStatus status = ProgressStatus.IN_PROGRESS;

    @Min(0)
    private int earnedPoints = 0;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public TrainingModule getModule() { return module; }
    public void setModule(TrainingModule module) { this.module = module; }

    public Unit getLastVisitedUnit() { return lastVisitedUnit; }
    public void setLastVisitedUnit(Unit lastVisitedUnit) { this.lastVisitedUnit = lastVisitedUnit; }

    public UnitContent getLastVisitedContent() { return lastVisitedContent; }
    public void setLastVisitedContent(UnitContent lastVisitedContent) { this.lastVisitedContent = lastVisitedContent; }

    public ProgressStatus getStatus() { return status; }
    public void setStatus(ProgressStatus status) { this.status = status; }

    public int getEarnedPoints() { return earnedPoints; }
    public void setEarnedPoints(int earnedPoints) { this.earnedPoints = earnedPoints; }
}
