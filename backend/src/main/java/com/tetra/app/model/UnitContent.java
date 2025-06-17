package com.tetra.app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "unit_content")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UnitContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", foreignKey = @ForeignKey(name = "unit_content_unit_id_fkey"))
    @JsonIgnore
    private Unit unit;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String contentData;

    @Column(name = "url")
    private String url;
    @Column(name = "points")
    private Integer points;

    @Column(name = "questions_number")
    private Integer questionsNumber;
    @JsonProperty("content")
    public String getContent() {
        return contentData;
    }

    @JsonProperty("content")
    public void setContent(String contentData) {
        this.contentData = contentData;
    }


    public UnitContent() {
    }

    public UnitContent(Unit unit, Integer sortOrder, String contentType, String title, String contentData, String url, Integer points, Integer questionsNumber) {
        this.unit = unit;
        this.sortOrder = sortOrder;
        this.contentType = contentType;
        this.title = title;
        this.contentData = contentData;
        this.url = url;
        this.points = points;
        this.questionsNumber = questionsNumber;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    @JsonProperty("unitId")
    public UUID getUnitId() {
        return unit != null ? unit.getId() : null;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentData() {
        return contentData;
    }

    public void setContentData(String contentData) {
        this.contentData = contentData;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getQuestionsNumber() {
        return questionsNumber;
    }

    public void setQuestionsNumber(Integer questionsNumber) {
        this.questionsNumber = questionsNumber;
    }
}