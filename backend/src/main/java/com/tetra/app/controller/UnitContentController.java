package com.tetra.app.controller;

import com.tetra.app.model.UnitContent;
import com.tetra.app.model.Question;
import com.tetra.app.model.Answer;
import com.tetra.app.model.Unit;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.repository.BlacklistedTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import com.tetra.app.security.JwtUtil;
import com.tetra.app.repository.BlacklistedTokenRepository;

@RestController
@RequestMapping("/api/unit_content")
public class UnitContentController {

    private static final Logger logger = LoggerFactory.getLogger(UnitContentController.class);

    private final UnitContentRepository unitContentRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final com.tetra.app.repository.UnitRepository unitRepository;
    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public UnitContentController(
        UnitContentRepository unitContentRepository,
        QuestionRepository questionRepository,
        AnswerRepository answerRepository,
        com.tetra.app.repository.UnitRepository unitRepository,
        JwtUtil jwtUtil,
        BlacklistedTokenRepository blacklistedTokenRepository
    ) {
        this.unitContentRepository = unitContentRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.unitRepository = unitRepository;
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
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
        result.put("unit_id", content.getUnitId());
        result.put("content_type", content.getContentType());
        result.put("title", content.getTitle());
        result.put("content", content.getContent()); // plain text description
        result.put("sort_order", content.getSortOrder());
        result.put("points", content.getPoints());
        result.put("questions_number", content.getQuestionsNumber());

        // Get questions and answers
        List<Question> questions = questionRepository.findByUnitContent_Id(content.getId());
        List<Map<String, Object>> questionsList = questions.stream().map(q -> {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("title", q.getTitle());
            qMap.put("type", q.getType());
            qMap.put("sort_order", q.getSortOrder());
            List<Answer> answers = answerRepository.findByQuestion_Id(q.getId());
            List<Map<String, Object>> answersList = answers.stream().map(a -> {
                Map<String, Object> aMap = new HashMap<>();
                aMap.put("id", a.getId());
                aMap.put("title", a.getTitle());
                aMap.put("is_correct", a.getIsCorrect());
                aMap.put("sort_order", a.getSortOrder());
                return aMap;
            }).collect(Collectors.toList());
            qMap.put("answers", answersList);
            return qMap;
        }).collect(Collectors.toList());
        result.put("questions", questionsList);

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

    @GetMapping("/article/{id}")
    public ResponseEntity<?> getArticleContent(@PathVariable UUID id) {
        UnitContent content = unitContentRepository.findByIdAndContentTypeIgnoreCase(id, "article")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Content block does not exist or is not of type article"));
        Map<String, Object> result = new HashMap<>();
        result.put("id", content.getId());
        result.put("title", content.getTitle());
        result.put("content", content.getContentData());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/quiz")
    @Transactional
    public ResponseEntity<?> createQuizContent(@RequestBody Map<String, Object> body) {
        try {
            String unitIdStr = (String) body.get("unit_id");
            if (unitIdStr == null || unitIdStr.isEmpty()) {
                return ResponseEntity.badRequest().body("unit_id is required");
            }
            UUID unitId = UUID.fromString(unitIdStr);

            String contentType = (String) body.get("content_type");
            if (contentType == null || !contentType.equalsIgnoreCase("quiz")) {
                return ResponseEntity.badRequest().body("content_type must be 'quiz'");
            }

            String title = (String) body.get("title");
            if (title == null || title.isEmpty()) {
                return ResponseEntity.badRequest().body("title is required");
            }

            // Use content as plain text description
            String content = (String) body.get("content");

            Integer points = body.get("points") instanceof Integer
                    ? (Integer) body.get("points")
                    : Integer.parseInt(body.get("points").toString());
            Integer questionsNumber = body.get("questions_number") instanceof Integer
                    ? (Integer) body.get("questions_number")
                    : Integer.parseInt(body.get("questions_number").toString());

            Integer sortOrder = body.get("sort_order") instanceof Integer
                    ? (Integer) body.get("sort_order")
                    : Integer.parseInt(body.get("sort_order").toString());

            Unit unit = unitRepository.findById(unitId).orElse(null);
            if (unit == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit not found");
            }

            UnitContent unitContent = new UnitContent();
            unitContent.setUnit(unit);
            unitContent.setContentType(contentType);
            unitContent.setTitle(title);
            unitContent.setContent(content);
            unitContent.setSortOrder(sortOrder);
            unitContent.setPoints(points);
            unitContent.setQuestionsNumber(questionsNumber);
            unitContent = unitContentRepository.saveAndFlush(unitContent);

            List<Map<String, Object>> questionsData = (List<Map<String, Object>>) body.get("questions");
            if (questionsData != null) {
                for (Map<String, Object> questionData : questionsData) {
                    String questionTitle = (String) questionData.get("title");
                    String questionType = (String) questionData.get("type");
                    Integer questionSortOrder = questionData.get("sort_order") instanceof Integer
                            ? (Integer) questionData.get("sort_order")
                            : Integer.parseInt(questionData.get("sort_order").toString());

                    List<Map<String, Object>> answersData = (List<Map<String, Object>>) questionData.get("answers");

                    Question question = new Question();
                    question.setUnitContent(unitContent);
                    question.setTitle(questionTitle);
                    question.setType(questionType);
                    question.setSortOrder(questionSortOrder);
                    question = questionRepository.saveAndFlush(question);

                    if (answersData != null) {
                        for (Map<String, Object> answerData : answersData) {
                            String answerTitle = (String) answerData.get("title");
                            Boolean isCorrect = answerData.get("is_correct") instanceof Boolean
                                    ? (Boolean) answerData.get("is_correct")
                                    : Boolean.parseBoolean(answerData.get("is_correct").toString());
                            Integer answerSortOrder = answerData.get("sort_order") instanceof Integer
                                    ? (Integer) answerData.get("sort_order")
                                    : Integer.parseInt(answerData.get("sort_order").toString());

                            Answer answer = new Answer();
                            answer.setQuestion(question);
                            answer.setTitle(answerTitle);
                            answer.setIsCorrect(isCorrect);
                            answer.setSortOrder(answerSortOrder);
                            answerRepository.saveAndFlush(answer);
                        }
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", unitContent.getId());
            response.put("unit_id", unitContent.getUnitId());
            response.put("content_type", unitContent.getContentType());
            response.put("title", unitContent.getTitle());
            response.put("content", unitContent.getContent()); // <-- return plain text
            response.put("sort_order", unitContent.getSortOrder());
            response.put("points", unitContent.getPoints());
            response.put("questions_number", unitContent.getQuestionsNumber());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating quiz content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/article")
    @Transactional
    public ResponseEntity<?> createArticleContent(@RequestBody Map<String, Object> body) {
        try {
            String unitIdStr = (String) body.get("unit_id");
            if (unitIdStr == null || unitIdStr.isEmpty()) {
                return ResponseEntity.badRequest().body("unit_id is required");
            }
            UUID unitId = UUID.fromString(unitIdStr);

            String contentType = (String) body.get("content_type");
            if (contentType == null || !contentType.equalsIgnoreCase("article")) {
                return ResponseEntity.badRequest().body("content_type must be 'article'");
            }

            String title = (String) body.get("title");
            if (title == null || title.isEmpty()) {
                return ResponseEntity.badRequest().body("title is required");
            }

            String content = (String) body.get("content");
            if (content == null || content.isEmpty()) {
                return ResponseEntity.badRequest().body("content is required");
            }

            Object sortOrderObj = body.get("sort_order");
            if (sortOrderObj == null) {
                return ResponseEntity.badRequest().body("sort_order is required");
            }
            int sortOrder;
            try {
                sortOrder = (sortOrderObj instanceof Integer)
                        ? (Integer) sortOrderObj
                        : Integer.parseInt(sortOrderObj.toString());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("sort_order must be a non-negative integer");
            }
            if (sortOrder < 0) {
                return ResponseEntity.badRequest().body("sort_order must be a non-negative integer");
            }

            Integer points = null;
            if (body.containsKey("points") && body.get("points") != null) {
                Object pointsObj = body.get("points");
                if (pointsObj instanceof Integer) {
                    points = (Integer) pointsObj;
                } else {
                    try {
                        points = Integer.parseInt(pointsObj.toString());
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body("points must be an integer");
                    }
                }
            }

            // Validate unit exists
            Unit unit = unitRepository.findById(unitId).orElse(null);
            if (unit == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit not found");
            }

            // Check for duplicate sort_order in the same unit
            boolean sortOrderExists = unitContentRepository.findByUnit_Id(unitId)
                .stream()
                .anyMatch(uc -> uc.getSortOrder() != null && uc.getSortOrder().equals(sortOrder));
            if (sortOrderExists) {
                return ResponseEntity.badRequest().body("sort_order already exists for this unit");
            }

            UnitContent unitContent = new UnitContent();
            unitContent.setUnit(unit);
            unitContent.setContentType("article");
            unitContent.setTitle(title);
            unitContent.setContent(content);
            unitContent.setSortOrder(sortOrder);
            unitContent.setPoints(points);

            unitContent = unitContentRepository.saveAndFlush(unitContent);

            Map<String, Object> response = new HashMap<>();
            response.put("id", unitContent.getId());
            response.put("unit_id", unitContent.getUnitId());
            response.put("content_type", unitContent.getContentType());
            response.put("title", unitContent.getTitle());
            response.put("content", unitContent.getContent());
            response.put("sort_order", unitContent.getSortOrder());
            response.put("points", unitContent.getPoints());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating article content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/video")
    @Transactional
    public ResponseEntity<?> createVideoContent(@RequestBody Map<String, Object> body) {
        try {
            String unitIdStr = (String) body.get("unit_id");
            if (unitIdStr == null || unitIdStr.isEmpty()) {
                return ResponseEntity.badRequest().body("unit_id is required");
            }
            UUID unitId = UUID.fromString(unitIdStr);

            String contentType = (String) body.get("content_type");
            if (contentType == null || !contentType.equalsIgnoreCase("video")) {
                return ResponseEntity.badRequest().body("content_type must be 'video'");
            }

            String title = (String) body.get("title");
            if (title == null || title.isEmpty()) {
                return ResponseEntity.badRequest().body("title is required");
            }

            String content = (String) body.get("content");
            String url = (String) body.get("url");
            if (url == null || url.isEmpty()) {
                return ResponseEntity.badRequest().body("url is required");
            }

            Object sortOrderObj = body.get("sort_order");
            if (sortOrderObj == null) {
                return ResponseEntity.badRequest().body("sort_order is required");
            }
            int sortOrder;
            try {
                sortOrder = (sortOrderObj instanceof Integer)
                        ? (Integer) sortOrderObj
                        : Integer.parseInt(sortOrderObj.toString());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("sort_order must be a non-negative integer");
            }
            if (sortOrder < 0) {
                return ResponseEntity.badRequest().body("sort_order must be a non-negative integer");
            }


            Integer points = null;
            if (body.containsKey("points") && body.get("points") != null) {
                Object pointsObj = body.get("points");
                if (pointsObj instanceof Integer) {
                    points = (Integer) pointsObj;
                } else {
                    try {
                        points = Integer.parseInt(pointsObj.toString());
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body("points must be an integer");
                    }
                }
            }

            // Validate unit exists
            Unit unit = unitRepository.findById(unitId).orElse(null);
            if (unit == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit not found");
            }

            // Check for duplicate sort_order in the same unit
            boolean sortOrderExists = unitContentRepository.findByUnit_Id(unitId)
                .stream()
                .anyMatch(uc -> uc.getSortOrder() != null && uc.getSortOrder().equals(sortOrder));
            if (sortOrderExists) {
                return ResponseEntity.badRequest().body("sort_order already exists for this unit");
            }

            UnitContent unitContent = new UnitContent();
            unitContent.setUnit(unit);
            unitContent.setContentType("video");
            unitContent.setTitle(title);
            unitContent.setContent(content);
            unitContent.setUrl(url);
            unitContent.setSortOrder(sortOrder);
            unitContent.setPoints(points);

            unitContent = unitContentRepository.saveAndFlush(unitContent);

            Map<String, Object> response = new HashMap<>();
            response.put("id", unitContent.getId());
            response.put("unit_id", unitContent.getUnitId());
            response.put("content_type", unitContent.getContentType());
            response.put("title", unitContent.getTitle());
            response.put("content", unitContent.getContent());
            response.put("url", unitContent.getUrl());
            response.put("sort_order", unitContent.getSortOrder());
            response.put("points", unitContent.getPoints());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating video content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/video/{id}")
    public ResponseEntity<?> updateVideoContent(
        @PathVariable UUID id,
        @RequestBody Map<String, Object> body,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is blacklisted (logged out)");
        }
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        Optional<UnitContent> optContent = unitContentRepository.findById(id);
        if (optContent.isEmpty() || !"video".equalsIgnoreCase(optContent.get().getContentType())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Video content not found");
        }
        UnitContent content = optContent.get();
        if (body.containsKey("title")) content.setTitle(String.valueOf(body.get("title")));
        if (body.containsKey("content")) content.setContent(String.valueOf(body.get("content")));
        if (body.containsKey("url")) content.setUrl(String.valueOf(body.get("url")));
        if (body.containsKey("sort_order")) {
            Object sortOrderObj = body.get("sort_order");
            try {
                int sortOrder = (sortOrderObj instanceof Integer)
                    ? (Integer) sortOrderObj
                    : Integer.parseInt(sortOrderObj.toString());
                content.setSortOrder(sortOrder);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("sort_order must be a number");
            }
        }
        if (body.containsKey("points")) {
            Object pointsObj = body.get("points");
            try {
                int points = (pointsObj instanceof Integer)
                    ? (Integer) pointsObj
                    : Integer.parseInt(pointsObj.toString());
                content.setPoints(points);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("points must be a number");
            }
        }
        unitContentRepository.saveAndFlush(content);
        Map<String, Object> response = new HashMap<>();
        response.put("id", content.getId());
        response.put("title", content.getTitle());
        response.put("content", content.getContent());
        response.put("url", content.getUrl());
        response.put("sort_order", content.getSortOrder());
        response.put("points", content.getPoints());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/article/{id}")
    public ResponseEntity<?> updateArticleContent(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is blacklisted (logged out)");
        }
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        Optional<UnitContent> optContent = unitContentRepository.findById(id);
        if (optContent.isEmpty() || !"article".equalsIgnoreCase(optContent.get().getContentType())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Article content not found");
        }

        UnitContent content = optContent.get();

        if (body.containsKey("title")) {
            content.setTitle(String.valueOf(body.get("title")));
        }

        if (body.containsKey("content")) {
            content.setContent(String.valueOf(body.get("content")));
        }

        if (body.containsKey("sort_order")) {
            Object sortOrderObj = body.get("sort_order");
            try {
                int sortOrder = (sortOrderObj instanceof Integer)
                        ? (Integer) sortOrderObj
                        : Integer.parseInt(sortOrderObj.toString());

                if (sortOrder < 0) {
                    return ResponseEntity.badRequest().body("sort_order must be a non-negative integer");
                }

                boolean sortOrderExists = unitContentRepository.findByUnit_Id(content.getUnitId())
                        .stream()
                        .anyMatch(uc -> !uc.getId().equals(id) &&
                                uc.getSortOrder() != null &&
                                uc.getSortOrder().equals(sortOrder));

                if (sortOrderExists) {
                    return ResponseEntity.badRequest().body("sort_order already exists for this unit");
                }

                content.setSortOrder(sortOrder);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("sort_order must be a number");
            }
        }

        unitContentRepository.saveAndFlush(content);

        Map<String, Object> response = new HashMap<>();
        response.put("id", content.getId());
        response.put("title", content.getTitle());
        response.put("content", content.getContent());
        response.put("sort_order", content.getSortOrder());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUnitContent(
        @PathVariable UUID id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (blacklistedTokenRepository.existsByToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is blacklisted (logged out)");
        }
        String role;
        try {
            role = jwtUtil.extractRole(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        if (!unitContentRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Unit content not found with id: " + id);
        }

        UnitContent unitContent = unitContentRepository.findById(id).orElse(null);
        if (unitContent != null && "quiz".equalsIgnoreCase(unitContent.getContentType())) {
            // Delete all related answers and questions
            List<Question> questions = questionRepository.findByUnitContent_Id(id);
            for (Question q : questions) {
                answerRepository.deleteAll(answerRepository.findByQuestion_Id(q.getId()));
            }
            questionRepository.deleteAll(questions);
        }
        unitContentRepository.deleteById(id);
        return ResponseEntity.ok("Unit content deleted");
    }
}