package com.tetra.app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.*;

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

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<UnitContent> unitContent;
        @Column(name = "sort_order")
        private Integer sortOrder;

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

    public java.util.List<UnitContent> getUnitContent() {
        return unitContent;
    }

    public void setUnitContent(java.util.List<UnitContent> unitContent) {
        this.unitContent = unitContent;
    }

        @JsonProperty("sort_order")
        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
}