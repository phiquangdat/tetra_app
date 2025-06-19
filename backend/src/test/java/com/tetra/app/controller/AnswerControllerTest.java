package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.TestSecurityConfig;
import com.tetra.app.model.Answer;
import com.tetra.app.model.Question;
import com.tetra.app.repository.AnswerRepository;
import com.tetra.app.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnswerController.class)
@Import(TestSecurityConfig.class)
class AnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnswerRepository answerRepository;

    @MockBean
    private QuestionRepository questionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID questionId;
    private Question question;
    private Answer answer;

    @BeforeEach
    void setup() {
        questionId = UUID.randomUUID();
        question = new Question();
        question.setId(questionId);
        question.setTitle("Sample Question");

        answer = new Answer();
        answer.setId(UUID.randomUUID());
        answer.setTitle("Test Answer");
        answer.setIsCorrect(true);
        answer.setSortOrder(1);
        answer.setQuestion(question);
    }

    @Test
    void testGetAllAnswers() throws Exception {
        when(answerRepository.findAll()).thenReturn(List.of(answer));

        mockMvc.perform(get("/api/answers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Answer"));
    }

    @Test
    void testGetAnswerById() throws Exception {
        when(answerRepository.findById(answer.getId())).thenReturn(Optional.of(answer));

        mockMvc.perform(get("/api/answers/" + answer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Answer"));
    }

    @Test
    void testGetByQuestion() throws Exception {
        when(answerRepository.findByQuestion_Id(questionId)).thenReturn(List.of(answer));

        mockMvc.perform(get("/api/answers/by-question/" + questionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Answer"));
    }

    @Test
    void testCreateAnswerSuccess() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("question_id", questionId.toString());
        body.put("title", "New Answer");
        body.put("is_correct", true);
        body.put("sort_order", 1);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(answerRepository.save(any(Answer.class))).thenReturn(answer);

        mockMvc.perform(post("/api/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Answer"));
    }

    @Test
    void testCreateAnswerMissingFields() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("title", "Incomplete");

        mockMvc.perform(post("/api/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("question_id, title, is_correct, and sort_order are required"));
    }

    @Test
    public void testUpdateAnswer() throws Exception {
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(answerRepository.save(any(Answer.class))).thenReturn(answer);

        answer.setId(UUID.randomUUID());

        String json = objectMapper.writeValueAsString(answer);

        mockMvc.perform(put("/api/answers/{id}", answer.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteAnswer() throws Exception {
        UUID answerId = UUID.randomUUID();

        doNothing().when(answerRepository).deleteById(answerId);

        mockMvc.perform(delete("/api/answers/" + answerId))
                .andExpect(status().isOk()); // your controller doesn't return anything explicitly
    }
}
