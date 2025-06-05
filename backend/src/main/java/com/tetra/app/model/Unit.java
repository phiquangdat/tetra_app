package com.tetra.app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "units", indexes = {
        @Index(name = "idx_unit_module", columnList = "module_id")
})
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", foreignKey = @ForeignKey(name = "units_module_id_fkey"))
    @JsonIgnore
    private TrainingModule module;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    public Unit() {}

    public Unit(TrainingModule module, String title, String description) {
        this.module = module;
        this.title = title;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public TrainingModule getModule() {
        return module;
    }

    public void setModule(TrainingModule module) {
        this.module = module;
    }

    public UUID getModuleId() {
        return module != null ? module.getId() : null;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}