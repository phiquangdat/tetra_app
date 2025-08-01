package com.tetra.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UnitContentRepository;
import com.tetra.app.repository.BlacklistedTokenRepository;
import com.tetra.app.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UnitContentController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
public class UnitContentControllerPutTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UnitContentRepository unitContentRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @MockBean
    private com.tetra.app.repository.QuestionRepository questionRepository;

    @MockBean
    private com.tetra.app.repository.AnswerRepository answerRepository;

    @MockBean
    private com.tetra.app.repository.UnitRepository unitRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID videoId;
    private UnitContent videoContent;

    private UUID articleId;
    private UnitContent articleContent;

    @BeforeEach
    void setup() {
        videoId = UUID.randomUUID();
        videoContent = new UnitContent();
        videoContent.setId(videoId);
        videoContent.setContentType("video");
        Mockito.when(unitContentRepository.findById(videoId)).thenReturn(Optional.of(videoContent));

        articleId = UUID.randomUUID();
        articleContent = new UnitContent();
        articleContent.setId(articleId);
        articleContent.setContentType("article");
        articleContent.setSortOrder(1);
        Mockito.when(unitContentRepository.findById(articleId)).thenReturn(Optional.of(articleContent));
    }

    @Test
    void updateVideoContent_success() throws Exception {
        Mockito.when(jwtUtil.extractRole("validtoken")).thenReturn("ADMIN");
        Mockito.when(blacklistedTokenRepository.existsByToken("validtoken")).thenReturn(false);

        String json = """
        {
            "title": "Updated Video",
            "content": "Updated body",
            "url": "https://example.com/updated.mp4",
            "sort_order": 7,
            "points": 20
        }
        """;
        mockMvc.perform(put("/api/unit_content/video/" + videoId)
                .header("Authorization", "Bearer validtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Video"))
                .andExpect(jsonPath("$.url").value("https://example.com/updated.mp4"))
                .andExpect(jsonPath("$.sort_order").value(7))
                .andExpect(jsonPath("$.points").value(20));
    }

    @Test
    void updateVideoContent_unauthorized_missingHeader() throws Exception {
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/video/" + videoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void updateVideoContent_unauthorized_blacklistedToken() throws Exception {
        Mockito.when(blacklistedTokenRepository.existsByToken("blacklistedtoken")).thenReturn(true);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/video/" + videoId)
                .header("Authorization", "Bearer blacklistedtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Token is blacklisted (logged out)"));
    }

    @Test
    void updateVideoContent_unauthorized_invalidToken() throws Exception {
        Mockito.when(blacklistedTokenRepository.existsByToken("invalidtoken")).thenReturn(false);
        Mockito.doThrow(new RuntimeException("Invalid token")).when(jwtUtil).extractRole("invalidtoken");
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/video/" + videoId)
                .header("Authorization", "Bearer invalidtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void updateVideoContent_forbidden_nonAdminRole() throws Exception {
        Mockito.when(jwtUtil.extractRole("usertoken")).thenReturn("LEARNER");
        Mockito.when(blacklistedTokenRepository.existsByToken("usertoken")).thenReturn(false);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/video/" + videoId)
                .header("Authorization", "Bearer usertoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    void updateVideoContent_notFound() throws Exception {
        UUID notFoundId = UUID.randomUUID();
        Mockito.when(unitContentRepository.findById(notFoundId)).thenReturn(Optional.empty());
        Mockito.when(jwtUtil.extractRole("validtoken")).thenReturn("ADMIN");
        Mockito.when(blacklistedTokenRepository.existsByToken("validtoken")).thenReturn(false);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/video/" + notFoundId)
                .header("Authorization", "Bearer validtoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Video content not found"));
    }


    @Test
    void updateArticleContent_success() throws Exception {
        Mockito.when(jwtUtil.extractRole("validtoken")).thenReturn("ADMIN");
        Mockito.when(blacklistedTokenRepository.existsByToken("validtoken")).thenReturn(false);
        Mockito.when(unitContentRepository.findByUnit_Id(Mockito.any())).thenReturn(java.util.Collections.emptyList());

        String json = """
        {
            "title": "Updated Article",
            "content": "<p><span>Update content</span></p>",
            "sort_order": 5
        }
        """;

        mockMvc.perform(put("/api/unit_content/article/" + articleId)
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Article"))
                .andExpect(jsonPath("$.content").value("<p><span>Update content</span></p>"))
                .andExpect(jsonPath("$.sort_order").value(5));
    }

    @Test
    void updateArticleContent_unauthorized_missingHeader() throws Exception {
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/article/" + articleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid Authorization header"));
    }

    @Test
    void updateArticleContent_unauthorized_blacklistedToken() throws Exception {
        Mockito.when(blacklistedTokenRepository.existsByToken("blacklistedtoken")).thenReturn(true);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/article/" + articleId)
                        .header("Authorization", "Bearer blacklistedtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Token is blacklisted (logged out)"));
    }

    @Test
    void updateArticleContent_unauthorized_invalidToken() throws Exception {
        Mockito.when(blacklistedTokenRepository.existsByToken("invalidtoken")).thenReturn(false);
        Mockito.doThrow(new RuntimeException("Invalid token")).when(jwtUtil).extractRole("invalidtoken");
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/article/" + articleId)
                        .header("Authorization", "Bearer invalidtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid token"));
    }

    @Test
    void updateArticleContent_forbidden_nonAdminRole() throws Exception {
        Mockito.when(jwtUtil.extractRole("usertoken")).thenReturn("LEARNER");
        Mockito.when(blacklistedTokenRepository.existsByToken("usertoken")).thenReturn(false);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/article/" + articleId)
                        .header("Authorization", "Bearer usertoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Access denied"));
    }

    @Test
    void updateArticleContent_notFound() throws Exception {
        UUID notFoundId = UUID.randomUUID();
        Mockito.when(unitContentRepository.findById(notFoundId)).thenReturn(Optional.empty());
        Mockito.when(jwtUtil.extractRole("validtoken")).thenReturn("ADMIN");
        Mockito.when(blacklistedTokenRepository.existsByToken("validtoken")).thenReturn(false);
        String json = "{}";
        mockMvc.perform(put("/api/unit_content/article/" + notFoundId)
                        .header("Authorization", "Bearer validtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Article content not found"));
    }
}
