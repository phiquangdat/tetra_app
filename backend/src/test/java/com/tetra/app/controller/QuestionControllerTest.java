package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.Answer;
import com.tetra.app.model.Question;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.UnitContentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuestionController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionRepository questionRepository;

    @MockBean
    private UnitContentRepository unitContentRepository;

    @MockBean
    private AnswerRepository answerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Question question;
    private UUID questionId;
    private UUID contentId;
    private UnitContent unitContent;

    @BeforeEach
    void setUp() {
        contentId = UUID.randomUUID();
        questionId = UUID.randomUUID();
        unitContent = new UnitContent();
        unitContent.setId(contentId);

        question = new Question();
        question.setId(questionId);
        question.setUnitContent(unitContent);
        question.setType("single");
        question.setTitle("Sample Question");
        question.setSortOrder(1);
    }

    @Test
    void testGetAll() throws Exception {
        when(questionRepository.findAll()).thenReturn(List.of(question));
        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Sample Question"));
    }

    @Test
    void testGetById() throws Exception {
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        mockMvc.perform(get("/api/questions/" + questionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(questionId.toString()));
    }

    @Test
    void testCreate() throws Exception {
        when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(unitContent));
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("title", "Sample Question");
        questionMap.put("type", "single");
        questionMap.put("sortOrder", 1);
        Map<String, Object> unitContentMap = new HashMap<>();
        unitContentMap.put("id", contentId.toString());
        questionMap.put("unitContent", unitContentMap);

        mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(questionMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sample Question"));
    }

    @Test
    void testCreateWithoutUnitContentId() throws Exception {
        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("title", "Sample Question");
        questionMap.put("type", "single");
        questionMap.put("sortOrder", 1);
        questionMap.put("unitContent", new HashMap<>());

        mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(questionMap)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("UnitContent id is required"));
    }

    @Test
    void testCreateWithNonexistentUnitContent() throws Exception {
        when(unitContentRepository.findById(contentId)).thenReturn(Optional.empty());

        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("title", "Sample Question");
        questionMap.put("type", "single");
        questionMap.put("sortOrder", 1);
        Map<String, Object> unitContentMap = new HashMap<>();
        unitContentMap.put("id", contentId.toString());
        questionMap.put("unitContent", unitContentMap);

        mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(questionMap)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("UnitContent not found"));
    }

    @Test
    void testUpdate() throws Exception {
        when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(unitContent));
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("title", "Sample Question");
        questionMap.put("type", "single");
        questionMap.put("sortOrder", 1);
        Map<String, Object> unitContentMap = new HashMap<>();
        unitContentMap.put("id", contentId.toString());
        questionMap.put("unitContent", unitContentMap);

        mockMvc.perform(put("/api/questions/" + questionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(questionMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(questionId.toString()));
    }

    @Test
    void testDelete() throws Exception {
        doNothing().when(questionRepository).deleteById(questionId);
        mockMvc.perform(delete("/api/questions/" + questionId))
                .andExpect(status().isOk());
    }

    @Test
    void testGetByContent() throws Exception {
        when(questionRepository.findByUnitContent_Id(contentId)).thenReturn(List.of(question));
        mockMvc.perform(get("/api/questions/by-content/" + contentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].unitContent.id").value(contentId.toString()));
    }

    @Test
    void testGetQuizQuestionsWithAnswers_Success() throws Exception {
        UUID quizId = UUID.randomUUID();
        UnitContent quizContent = new UnitContent();
        quizContent.setId(quizId);
        quizContent.setContentType("quiz");

        Question q = new Question();
        q.setId(UUID.randomUUID());
        q.setTitle("Q1");
        q.setType("single");
        q.setSortOrder(1);
        q.setUnitContent(quizContent);

        Answer a = new Answer();
        a.setId(UUID.randomUUID());
        a.setTitle("A1");
        a.setSortOrder(1);
        a.setIsCorrect(true);
        a.setQuestion(q);

        when(unitContentRepository.findById(quizId)).thenReturn(Optional.of(quizContent));
        when(questionRepository.findByUnitContent_Id(quizId)).thenReturn(List.of(q));
        when(answerRepository.findByQuestion_Id(q.getId())).thenReturn(List.of(a));

        mockMvc.perform(get("/api/questions")
                        .param("contentId", quizId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quizId").value(quizId.toString()))
                .andExpect(jsonPath("$.questions[0].answers[0].is_correct").doesNotExist());
    }

    @Test
    void testGetQuizQuestionsWithAnswers_WithCorrectAnswers() throws Exception {
        UUID quizId = UUID.randomUUID();
        UnitContent quizContent = new UnitContent();
        quizContent.setId(quizId);
        quizContent.setContentType("quiz");

        Question q = new Question();
        q.setId(UUID.randomUUID());
        q.setTitle("Q1");
        q.setType("single");
        q.setSortOrder(1);
        q.setUnitContent(quizContent);

        Answer a = new Answer();
        a.setId(UUID.randomUUID());
        a.setTitle("A1");
        a.setSortOrder(1);
        a.setIsCorrect(true);
        a.setQuestion(q);

        when(unitContentRepository.findById(quizId)).thenReturn(Optional.of(quizContent));
        when(questionRepository.findByUnitContent_Id(quizId)).thenReturn(List.of(q));
        when(answerRepository.findByQuestion_Id(q.getId())).thenReturn(List.of(a));

        mockMvc.perform(get("/api/questions")
                        .param("contentId", quizId.toString())
                        .param("includeCorrect", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quizId").value(quizId.toString()))
                .andExpect(jsonPath("$.questions[0].answers[0].is_correct").value(true));
    }

    @Test
    void testGetQuizQuestionsWithAnswers_NotFound() throws Exception {
        UUID quizId = UUID.randomUUID();
        when(unitContentRepository.findById(quizId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/questions").param("contentId", quizId.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetQuizQuestionsWithAnswers_NotQuizType() throws Exception {
        UUID quizId = UUID.randomUUID();
        UnitContent notQuiz = new UnitContent();
        notQuiz.setId(quizId);
        notQuiz.setContentType("video");

        when(unitContentRepository.findById(quizId)).thenReturn(Optional.of(notQuiz));

        mockMvc.perform(get("/api/questions").param("contentId", quizId.toString()))
                .andExpect(status().isNotFound());
    }
}
