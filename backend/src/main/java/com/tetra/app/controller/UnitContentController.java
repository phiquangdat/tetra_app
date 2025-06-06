package com.tetra.app.controller;

import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UnitContentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

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
        if (unitContent == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(unitContent, HttpStatus.OK);
    }

}
