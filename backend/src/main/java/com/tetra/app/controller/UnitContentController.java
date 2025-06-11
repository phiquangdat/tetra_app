package com.tetra.app.controller;

import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UnitContentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/unit_content")
public class UnitContentController {

    private final UnitContentRepository unitContentRepository;

    public UnitContentController(UnitContentRepository unitContentRepository) {
        this.unitContentRepository = unitContentRepository;
    }

    @GetMapping
    public ResponseEntity<List<UnitContent>> getAll() {
        List<UnitContent> unitContent = unitContentRepository.findAll();
        if (unitContent == null || unitContent.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(unitContent, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitContent> getById(@PathVariable UUID id) {
        Optional<UnitContent> unitContent = unitContentRepository.findById(id);
        return unitContent.map(content -> new ResponseEntity<>(content, HttpStatus.OK))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unit content is not found with id: " + id));
    }

    @GetMapping(params = "unitId")
    public ResponseEntity<?> getByUnitId(@RequestParam("unitId") UUID unitId) {
        List<UnitContent> unitContentList = unitContentRepository.findByUnit_Id(unitId);

        List<Map<String, Object>> result = unitContentList.stream()
                .map(content -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", content.getId());
                    item.put("title", content.getTitle());
                    item.put("content_type", content.getContentType());
                    item.put("sort_order", content.getSortOrder());
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/quiz/{id}")
    public ResponseEntity<?> getQuizPreview(@PathVariable UUID id) {
        UnitContent content = unitContentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        if (!"quiz".equalsIgnoreCase(content.getContentType())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", content.getId());
        result.put("title", content.getTitle());
        result.put("content", content.getContentData());

        Integer points = null;
        Integer questionsNumber = null;
        try {
            com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(content.getContentData());
            if (node.has("points")) {
                points = node.get("points").asInt();
            }
            if (node.has("questions_number")) {
                questionsNumber = node.get("questions_number").asInt();
            }
        } catch (Exception e) {
        }
        result.put("points", points);
        result.put("questions_number", questionsNumber);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/video")
    public ResponseEntity<?> getAllVideoContent() {
        List<UnitContent> videoContentList = unitContentRepository.findByContentTypeIgnoreCase("video");

        List<Map<String, Object>> result = videoContentList.stream()
                .map(content -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", content.getId());
                    item.put("title", content.getTitle());
                    item.put("content", content.getContentData());
                    item.put("url", content.getUrl());
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/video/{id}")
    public ResponseEntity<?> getVideoContent(@PathVariable UUID id) {
        UnitContent content = unitContentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Content block does not exist"));
        if (!"video".equalsIgnoreCase(content.getContentType())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content block is not of type video");
        }
        Map<String, Object> result = new HashMap<>();
        result.put("id", content.getId());
        result.put("title", content.getTitle());
        result.put("content", content.getContentData());
        result.put("url", content.getUrl());
        return ResponseEntity.ok(result);
    }
}