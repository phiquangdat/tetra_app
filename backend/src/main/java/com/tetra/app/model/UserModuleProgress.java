package com.tetra.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(
    name = "user_module_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "module_id"})
)
public class UserModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private TrainingModule module;

    @ManyToOne
    @JoinColumn(name = "last_visited_unit_id")
    private Unit lastVisitedUnit;

    @ManyToOne
    @JoinColumn(name = "last_visited_content_id")
    private UnitContent lastVisitedContent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status;

    @Min(0)
    @Column(name = "earned_points", nullable = false)
    private int earnedPoints = 0;

    public UserModuleProgress() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TrainingModule getModule() {
        return module;
    }

    public void setModule(TrainingModule module) {
        this.module = module;
    }

    public Unit getLastVisitedUnit() {
        return lastVisitedUnit;
    }

    public void setLastVisitedUnit(Unit lastVisitedUnit) {
        this.lastVisitedUnit = lastVisitedUnit;
    }

    public UnitContent getLastVisitedContent() {
        return lastVisitedContent;
    }

    public void setLastVisitedContent(UnitContent lastVisitedContent) {
        this.lastVisitedContent = lastVisitedContent;
    }

    public ProgressStatus getStatus() {
        return status;
    }

    public void setStatus(ProgressStatus status) {
        this.status = status;
    }

    public int getEarnedPoints() {
        return earnedPoints;
    }

    public void setEarnedPoints(int earnedPoints) {
        this.earnedPoints = earnedPoints;
    }
}