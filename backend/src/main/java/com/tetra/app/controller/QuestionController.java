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
    public ResponseEntity<?> getQuizQuestionsWithAnswers(
            @RequestParam("contentId") UUID contentId,
            @RequestParam(name = "includeCorrect", required = false, defaultValue = "false") boolean includeCorrect) {

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
