package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.jayway.jsonpath.JsonPath;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UnitContentController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class UnitContentControllerTestPost {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UnitContentRepository unitContentRepository;

    @MockBean
    private com.tetra.app.repository.UnitRepository unitRepository;

    @MockBean
    private com.tetra.app.repository.QuestionRepository questionRepository;

    @MockBean
    private com.tetra.app.repository.AnswerRepository answerRepository;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @MockBean
    private com.tetra.app.security.JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID unitId;

    @BeforeEach
    void setup() {
        unitId = UUID.randomUUID();
        Unit unit = new Unit();
        unit.setId(unitId);
        Mockito.when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        // Mock saving UnitContent to avoid NullPointerException in controller
        Mockito.when(unitContentRepository.saveAndFlush(ArgumentMatchers.any(UnitContent.class)))
                .thenAnswer(invocation -> {
                    UnitContent uc = invocation.getArgument(0);
                    uc.setId(UUID.randomUUID());
                    return uc;
                });
    }

    @Test
    @WithMockUser
    void createQuizContent_success() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "quiz",
            "title": "Workplace Safety Quiz 22",
            "content": "Test your knowledge on workplace safety protocols and hazard prevention strategies.",
            "sort_order": 1,
            "points": 15,
            "questions_number": 2,
            "questions": [
              {
                "title": "Which of the following should be done in the event of a fire?",
                "type": "single",
                "sort_order": 1,
                "answers": [
                  { "title": "Evacuate immediately", "is_correct": true, "sort_order": 1 },
                  { "title": "Wait for the fire to extinguish", "is_correct": false, "sort_order": 2 },
                  { "title": "Call a colleague", "is_correct": false, "sort_order": 3 }
                ]
              },
              {
                "title": "What is the purpose of PPE (Personal Protective Equipment)?",
                "type": "single",
                "sort_order": 2,
                "answers": [
                  { "title": "To protect against workplace hazards", "is_correct": true, "sort_order": 1 },
                  { "title": "To look professional", "is_correct": false, "sort_order": 2 },
                  { "title": "For decoration", "is_correct": false, "sort_order": 3 }
                ]
              }
            ]
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Workplace Safety Quiz 22"))
                .andExpect(jsonPath("$.content_type").value("quiz"))
                .andExpect(jsonPath("$.content").value("Test your knowledge on workplace safety protocols and hazard prevention strategies."))
                .andExpect(jsonPath("$.points").value(15))
                .andExpect(jsonPath("$.questions_number").value(2));
    }

    @Test
    @WithMockUser
    void createQuizContent_unitNotFound() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "quiz",
            "title": "Test Quiz",
            "content": "Test description",
            "sort_order": 1,
            "points": 5,
            "questions_number": 1
        }
        """.formatted(UUID.randomUUID());

        Mockito.when(unitRepository.findById(Mockito.any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("Unit not found")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createQuizContent_missingTitle() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "quiz",
            "content": "Test description",
            "sort_order": 1,
            "points": 5,
            "questions_number": 1
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("title is required")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createQuizContent_wrongContentType() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "article",
            "title": "Test Quiz",
            "content": "Test description",
            "sort_order": 1,
            "points": 5,
            "questions_number": 1
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/quiz")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("content_type must be 'quiz'")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createArticleContent_success() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "article",
            "title": "Article Title",
            "content": "Article body text.",
            "sort_order": 3
        }
        """.formatted(unitId);

        // Mock duplicate sort_order check
        Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(post("/api/unit_content/article")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Article Title"))
                .andExpect(jsonPath("$.content_type").value("article"))
                .andExpect(jsonPath("$.content").value("Article body text."))
                .andExpect(jsonPath("$.sort_order").value(3));
    }

    @Test
    @WithMockUser
    void createArticleContent_missingTitle() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "article",
            "content": "Article body text.",
            "sort_order": 1
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/article")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("title is required")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createArticleContent_wrongContentType() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "quiz",
            "title": "Article Title",
            "content": "Article body text.",
            "sort_order": 1
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/article")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("content_type must be 'article'")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createArticleContent_duplicateSortOrder() throws Exception {
        // Simulate existing content with sort_order = 5
        UnitContent existing = new UnitContent();
        existing.setSortOrder(5);
        Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(java.util.List.of(existing));

        String json = """
        {
            "unit_id": "%s",
            "content_type": "article",
            "title": "Article Title",
            "content": "Article body text.",
            "sort_order": 5
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/article")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("sort_order already exists")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createVideoContent_success() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "video",
            "title": "AI in Business Strategies",
            "content": "AI in Business Strategies",
            "url": "https://www.youtube.com/watch?v=I0wpbbYFm5s",
            "sort_order": 11
        }
        """.formatted(unitId);

        Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(post("/api/unit_content/video")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("AI in Business Strategies"))
                .andExpect(jsonPath("$.content_type").value("video"))
                .andExpect(jsonPath("$.content").value("AI in Business Strategies"))
                .andExpect(jsonPath("$.url").value("https://www.youtube.com/watch?v=I0wpbbYFm5s"))
                .andExpect(jsonPath("$.sort_order").value(11));
    }

    @Test
    @WithMockUser
    void createVideoContent_missingTitle() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "video",
            "content": "AI in Business Strategies",
            "url": "https://www.youtube.com/watch?v=I0wpbbYFm5s",
            "sort_order": 11
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/video")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("title is required")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createVideoContent_missingUrl() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "video",
            "title": "AI in Business Strategies",
            "content": "AI in Business Strategies",
            "sort_order": 11
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/video")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("url is required")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createVideoContent_wrongContentType() throws Exception {
        String json = """
        {
            "unit_id": "%s",
            "content_type": "article",
            "title": "AI in Business Strategies",
            "content": "AI in Business Strategies",
            "url": "https://www.youtube.com/watch?v=I0wpbbYFm5s",
            "sort_order": 11
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/video")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("content_type must be 'video'")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createVideoContent_duplicateSortOrder() throws Exception {
        UnitContent existing = new UnitContent();
        existing.setSortOrder(11);
        Mockito.when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(java.util.List.of(existing));

        String json = """
        {
            "unit_id": "%s",
            "content_type": "video",
            "title": "AI in Business Strategies",
            "content": "AI in Business Strategies",
            "url": "https://www.youtube.com/watch?v=I0wpbbYFm5s",
            "sort_order": 11
        }
        """.formatted(unitId);

        mockMvc.perform(post("/api/unit_content/video")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("sort_order already exists")) throw new AssertionError("Unexpected error: " + msg);
                });
    }

    @Test
    @WithMockUser
    void createVideoContent_unitNotFound() throws Exception {
        UUID fakeUnitId = UUID.randomUUID();
        Mockito.when(unitRepository.findById(fakeUnitId)).thenReturn(Optional.empty());

        String json = """
        {
            "unit_id": "%s",
            "content_type": "video",
            "title": "AI in Business Strategies",
            "content": "AI in Business Strategies",
            "url": "https://www.youtube.com/watch?v=I0wpbbYFm5s",
            "sort_order": 11
        }
        """.formatted(fakeUnitId);

        mockMvc.perform(post("/api/unit_content/video")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound())
                .andExpect(result -> {
                    String msg = result.getResponse().getContentAsString();
                    if (!msg.contains("Unit not found")) throw new AssertionError("Unexpected error: " + msg);
                });
    }
}
