package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.UnitContent;
import com.tetra.app.model.Question;
import com.tetra.app.model.Answer;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.QuestionRepository;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.*;

import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UnitContentController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class UnitContentControllerQuizPutTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UnitContentRepository unitContentRepository;
    @MockBean
    private QuestionRepository questionRepository;
    @MockBean
    private AnswerRepository answerRepository;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;
    @MockBean
    private com.tetra.app.repository.UnitRepository unitRepository;
    @MockBean
    private com.tetra.app.repository.AttachmentRepository attachmentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID quizId;
    private UnitContent quizContent;

    @BeforeEach
    void setup() {
        quizId = UUID.randomUUID();
        quizContent = new UnitContent();
        quizContent.setId(quizId);
        quizContent.setContentType("quiz");
        quizContent.setTitle("Old Quiz");
        quizContent.setContent("Old content");
        quizContent.setSortOrder(1);
        quizContent.setPoints(10);
        quizContent.setQuestionsNumber(1);

        when(unitContentRepository.findById(quizId)).thenReturn(Optional.of(quizContent));
        when(unitContentRepository.saveAndFlush(any(UnitContent.class))).thenAnswer(inv -> inv.getArgument(0));
        when(questionRepository.findByUnitContent_Id(quizId)).thenReturn(Collections.emptyList());
    }

    @Test
    void updateQuizContent_success() throws Exception {
        Mockito.when(jwtUtil.extractRole("admintoken")).thenReturn("ADMIN");
        Mockito.when(blacklistedTokenRepository.existsByToken("admintoken")).thenReturn(false);

        String json = """
        {
            "title": "Updated Quiz",
            "content": "Updated quiz content",
            "sort_order": 2,
            "points": 20,
            "questions_number": 2,
            "questions": [
                {
                    "title": "Q1",
                    "type": "single",
                    "sort_order": 1,
                    "answers": [
                        { "title": "A1", "is_correct": true, "sort_order": 1 }
                    ]
                }
            ]
        }
        """;

        // Prepare mock question and answer to be returned after update
        UUID questionId = UUID.randomUUID();
        UUID answerId = UUID.randomUUID();

        Question mockQuestion = new Question();
        mockQuestion.setId(questionId);
        mockQuestion.setTitle("Q1");
        mockQuestion.setType("single");
        mockQuestion.setSortOrder(1);
        mockQuestion.setUnitContent(quizContent);

        Answer mockAnswer = new Answer();
        mockAnswer.setId(answerId);
        mockAnswer.setTitle("A1");
        mockAnswer.setIsCorrect(true);
        mockAnswer.setSortOrder(1);
        mockAnswer.setQuestion(mockQuestion);

        // SaveAndFlush returns the same object with id set
        Mockito.when(questionRepository.saveAndFlush(any(Question.class))).thenReturn(mockQuestion);
        Mockito.when(answerRepository.saveAndFlush(any(Answer.class))).thenReturn(mockAnswer);

        // After update, these should be returned by findByUnitContent_Id and findByQuestion_Id
        Mockito.when(questionRepository.findByUnitContent_Id(quizId)).thenReturn(List.of(mockQuestion));
        Mockito.when(answerRepository.findByQuestion_Id(questionId)).thenReturn(List.of(mockAnswer));

        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .header("Authorization", "Bearer admintoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Quiz"))
                .andExpect(jsonPath("$.content").value("Updated quiz content"))
                .andExpect(jsonPath("$.sort_order").value(2))
                .andExpect(jsonPath("$.points").value(20))
                .andExpect(jsonPath("$.questions_number").value(2))
                .andExpect(jsonPath("$.questions[0].title").value("Q1"))
                .andExpect(jsonPath("$.questions[0].answers[0].title").value("A1"));
    }

    @Test
    void updateQuizContent_unauthorized_missingHeader() throws Exception {
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void updateQuizContent_unauthorized_blacklistedToken() throws Exception {
        when(blacklistedTokenRepository.existsByToken("blacklistedtoken")).thenReturn(true);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .header("Authorization", "Bearer blacklistedtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Token is blacklisted (logged out)"));
    }

    @Test
    void updateQuizContent_unauthorized_invalidToken() throws Exception {
        when(blacklistedTokenRepository.existsByToken("invalidtoken")).thenReturn(false);
        doThrow(new RuntimeException("Invalid token")).when(jwtUtil).extractRole("invalidtoken");
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .header("Authorization", "Bearer invalidtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void updateQuizContent_forbidden_nonAdminRole() throws Exception {
        when(jwtUtil.extractRole("usertoken")).thenReturn("LEARNER");
        when(blacklistedTokenRepository.existsByToken("usertoken")).thenReturn(false);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .header("Authorization", "Bearer usertoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    void updateQuizContent_notFound() throws Exception {
        UUID notFoundId = UUID.randomUUID();
        when(unitContentRepository.findById(notFoundId)).thenReturn(Optional.empty());
        when(jwtUtil.extractRole("admintoken")).thenReturn("ADMIN");
        when(blacklistedTokenRepository.existsByToken("admintoken")).thenReturn(false);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/quiz/" + notFoundId)
                .header("Authorization", "Bearer admintoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Quiz content not found"));
    }

    @Test
    void updateQuizContent_notQuizType() throws Exception {
        UUID notQuizId = UUID.randomUUID();
        UnitContent notQuiz = new UnitContent();
        notQuiz.setId(notQuizId);
        notQuiz.setContentType("article");
        when(unitContentRepository.findById(notQuizId)).thenReturn(Optional.of(notQuiz));
        when(jwtUtil.extractRole("admintoken")).thenReturn("ADMIN");
        when(blacklistedTokenRepository.existsByToken("admintoken")).thenReturn(false);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/quiz/" + notQuizId)
                .header("Authorization", "Bearer admintoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Quiz content not found"));
    }

    @Test
    void updateQuizContent_invalidSortOrder() throws Exception {
        when(jwtUtil.extractRole("admintoken")).thenReturn("ADMIN");
        when(blacklistedTokenRepository.existsByToken("admintoken")).thenReturn(false);
        String json = """
        { "sort_order": "notanumber" }
        """;
        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .header("Authorization", "Bearer admintoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("sort_order must be a number"));
    }

    @Test
    void updateQuizContent_invalidPoints() throws Exception {
        when(jwtUtil.extractRole("admintoken")).thenReturn("ADMIN");
        when(blacklistedTokenRepository.existsByToken("admintoken")).thenReturn(false);
        String json = """
        { "points": "notanumber" }
        """;
        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .header("Authorization", "Bearer admintoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("points must be a number"));
    }

    @Test
    void updateQuizContent_invalidQuestionsNumber() throws Exception {
        when(jwtUtil.extractRole("admintoken")).thenReturn("ADMIN");
        when(blacklistedTokenRepository.existsByToken("admintoken")).thenReturn(false);
        String json = """
        { "questions_number": "notanumber" }
        """;
        mockMvc.perform(put("/api/unit_content/quiz/" + quizId)
                .header("Authorization", "Bearer admintoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("questions_number must be a number"));
    }
}
