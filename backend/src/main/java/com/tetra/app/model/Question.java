package com.tetra.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "questions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", foreignKey = @ForeignKey(name = "questions_unit_content_fk"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private UnitContent unitContent;

    @Column(name = "type")
    private String type;

    @Column(name = "title")
    private String title;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Answer> answers;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UnitContent getUnitContent() {
        return unitContent;
    }

    public void setUnitContent(UnitContent unitContent) {
        this.unitContent = unitContent;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public java.util.List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(java.util.List<Answer> answers) {
        this.answers = answers;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("unitContentId")
    public UUID getUnitContentId() {
        return unitContent != null ? unitContent.getId() : null;
    }
}