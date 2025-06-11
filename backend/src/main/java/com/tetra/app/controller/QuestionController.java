package com.tetra.app.controller;

import com.tetra.app.model.Question;
import com.tetra.app.model.UnitContent;
import com.tetra.app.model.Answer;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.AnswerRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final UnitContentRepository unitContentRepository;
    private final AnswerRepository answerRepository;

    public QuestionController(
            QuestionRepository questionRepository,
            UnitContentRepository unitContentRepository,
            AnswerRepository answerRepository
    ) {
        this.questionRepository = questionRepository;
        this.unitContentRepository = unitContentRepository;
        this.answerRepository = answerRepository;
    }

    @GetMapping
    public List<Question> getAll() {
        return questionRepository.findAll();
    }

    @GetMapping("/by-content/{contentId}")
    public List<Question> getByContent(@PathVariable UUID contentId) {
        return questionRepository.findByUnitContent_Id(contentId);
    }

    @GetMapping("/{id}")
    public Question getById(@PathVariable UUID id) {
        return questionRepository.findById(id).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Question question) {
        if (question.getUnitContent() == null || question.getUnitContent().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent id is required");
        }
        UnitContent unitContent = unitContentRepository.findById(question.getUnitContent().getId()).orElse(null);
        if (unitContent == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent not found");
        }
        question.setUnitContent(unitContent);
        Question saved = questionRepository.save(question);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Question question) {
        if (question.getUnitContent() == null || question.getUnitContent().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent id is required");
        }
        UnitContent unitContent = unitContentRepository.findById(question.getUnitContent().getId()).orElse(null);
        if (unitContent == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UnitContent not found");
        }
        question.setId(id);
        question.setUnitContent(unitContent);
        Question saved = questionRepository.save(question);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        questionRepository.deleteById(id);
    }

    @GetMapping(params = "contentId")
    public ResponseEntity<?> getQuizQuestionsWithAnswers(@RequestParam("contentId") UUID contentId) {
        // 1. Validate unit_content existence and type
        UnitContent unitContent = unitContentRepository.findById(contentId)
                .orElse(null);
        if (unitContent == null || !"quiz".equalsIgnoreCase(unitContent.getContentType())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Quiz not found");
        }

        // 2. Fetch questions by contentId, ordered by sort_order
        List<Question> questions = questionRepository.findByUnitContent_Id(contentId)
                .stream()
                .sorted(java.util.Comparator.comparing(Question::getSortOrder, java.util.Comparator.nullsLast(Integer::compareTo)))
                .toList();

        // 3. For each question, fetch answers ordered by sort_order, exclude is_correct
        List<Map<String, Object>> questionsList = new java.util.ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> qMap = new java.util.LinkedHashMap<>();
            qMap.put("id", q.getId());
            qMap.put("title", q.getTitle());
            qMap.put("type", q.getType());
            qMap.put("sort_order", q.getSortOrder());

            List<Map<String, Object>> answersList = answerRepository.findByQuestion_Id(q.getId()).stream()
                    .sorted(java.util.Comparator.comparing(a -> a.getSortOrder() == null ? 0 : a.getSortOrder()))
                    .map(a -> {
                        Map<String, Object> aMap = new java.util.LinkedHashMap<>();
                        aMap.put("id", a.getId());
                        aMap.put("title", a.getTitle());
                        aMap.put("sort_order", a.getSortOrder());
                        return aMap;
                    }).toList();

            qMap.put("answers", answersList);
            questionsList.add(qMap);
        }

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("quizId", contentId);
        response.put("questions", questionsList);

        return ResponseEntity.ok(response);
    }
}
