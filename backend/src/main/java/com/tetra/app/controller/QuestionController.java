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

import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final UnitContentRepository unitContentRepository;
    private final AnswerRepository answerRepository;
    private final com.tetra.app.security.JwtUtil jwtUtil;

    public QuestionController(
            QuestionRepository questionRepository,
            UnitContentRepository unitContentRepository,
            AnswerRepository answerRepository,
            com.tetra.app.security.JwtUtil jwtUtil
    ) {
        this.questionRepository = questionRepository;
        this.unitContentRepository = unitContentRepository;
        this.answerRepository = answerRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        return ResponseEntity.ok(questionRepository.findAll());
    }

    @GetMapping("/by-content/{contentId}")
    public ResponseEntity<?> getByContent(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable UUID contentId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        return ResponseEntity.ok(questionRepository.findByUnitContent_Id(contentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable UUID id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        return ResponseEntity.ok(questionRepository.findById(id).orElse(null));
    }

    @PostMapping
    public ResponseEntity<?> create(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Question question) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
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
    public ResponseEntity<?> update(
        @PathVariable UUID id,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Question question) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
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
    public ResponseEntity<?> getQuizQuestionsWithAnswers(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestParam("contentId") UUID contentId,
        @RequestParam(name = "includeCorrect", required = false, defaultValue = "false") boolean includeCorrect) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        UnitContent unitContent = unitContentRepository.findById(contentId).orElse(null);
        if (unitContent == null || !"quiz".equalsIgnoreCase(unitContent.getContentType())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Quiz not found");
        }
        List<Question> questions = questionRepository.findByUnitContent_Id(contentId)
                .stream()
                .sorted(Comparator.comparing(Question::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .toList();
        List<Map<String, Object>> questionsList = new ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> qMap = new LinkedHashMap<>();
            qMap.put("id", q.getId());
            qMap.put("title", q.getTitle());
            qMap.put("type", q.getType());
            qMap.put("sort_order", q.getSortOrder());

            List<Map<String, Object>> answersList = answerRepository.findByQuestion_Id(q.getId()).stream()
                    .sorted(Comparator.comparing(a -> a.getSortOrder() == null ? 0 : a.getSortOrder()))
                    .map(a -> {
                        Map<String, Object> aMap = new LinkedHashMap<>();
                        aMap.put("id", a.getId());
                        aMap.put("title", a.getTitle());
                        aMap.put("sort_order", a.getSortOrder());
                        if (includeCorrect) {
                            aMap.put("is_correct", a.getIsCorrect());
                        }
                        return aMap;
                    }).toList();

            qMap.put("answers", answersList);
            questionsList.add(qMap);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("quizId", contentId);
        response.put("questions", questionsList);

        return ResponseEntity.ok(response);
    }
}
