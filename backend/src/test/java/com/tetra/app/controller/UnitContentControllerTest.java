package com.tetra.app.controller;

import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UnitContentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UnitContentControllerTest {

    @Mock
    private UnitContentRepository unitContentRepository;

    @InjectMocks
    private UnitContentController unitContentController;

    @Test
    void testGetAllUnitContent() {
        
        UnitContent content1 = new UnitContent(null, 1, "text", "Title 1", "Content 1", "http://example.com/1");
        UnitContent content2 = new UnitContent(null, 2, "video", "Title 2", "Content 2", "http://example.com/2");
        List<UnitContent> mockUnitContent = List.of(content1, content2);

        when(unitContentRepository.findAll()).thenReturn(mockUnitContent);

        
        ResponseEntity<List<UnitContent>> response = unitContentController.getAll();

        
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(unitContentRepository, times(1)).findAll();
    }

    @Test
    void testGetUnitContentById_Success() {
        
        UUID contentId = UUID.randomUUID();
        UnitContent mockContent = new UnitContent(null, 1, "text", "Title 1", "Content 1", "http://example.com/1");

        when(unitContentRepository.findById(contentId)).thenReturn(Optional.of(mockContent));

        
        ResponseEntity<UnitContent> response = unitContentController.getById(contentId);

        
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(mockContent, response.getBody());
        verify(unitContentRepository, times(1)).findById(contentId);
    }

    @Test
    void testGetUnitContentById_NotFound() {
        
        UUID contentId = UUID.randomUUID();

        when(unitContentRepository.findById(contentId)).thenReturn(Optional.empty());

       
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> unitContentController.getById(contentId));

        assertEquals(404, exception.getStatusCode().value());
        assertEquals("Unit content is not found with id: " + contentId, exception.getReason());
        verify(unitContentRepository, times(1)).findById(contentId);
    }

    @Test
    void testGetUnitContentByUnitId_Success() {
        
        UUID unitId = UUID.randomUUID();
        Unit unit = new Unit();
        unit.setId(unitId);
        UnitContent content1 = new UnitContent(unit, 1, "text", "Title 1", "Content 1", "http://example.com/1");
        UnitContent content2 = new UnitContent(unit, 2, "video", "Title 2", "Content 2", "http://example.com/2");
        List<UnitContent> mockUnitContent = List.of(content1, content2);

        when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(mockUnitContent);

        
        ResponseEntity<?> response = unitContentController.getByUnitId(unitId);

        
        assertEquals(200, response.getStatusCode().value());
        List<?> body = (List<?>) response.getBody();
        assertEquals(2, body.size());

        Map<?, ?> first = (Map<?, ?>) body.get(0);
        assertEquals(content1.getId(), first.get("id"));
        assertEquals(content1.getTitle(), first.get("title"));
        assertEquals(content1.getContentType(), first.get("content_type"));
        assertEquals(content1.getSortOrder(), first.get("sort_order"));

        assertTrue(first.containsKey("id"));
        assertTrue(first.containsKey("title"));
        assertTrue(first.containsKey("content_type"));
        assertTrue(first.containsKey("sort_order"));
    }

    @Test
    void testGetUnitContentByUnitId_NoContent() {
        
        UUID unitId = UUID.randomUUID();

        when(unitContentRepository.findByUnit_Id(unitId)).thenReturn(Collections.emptyList());

        
        ResponseEntity<?> response = unitContentController.getByUnitId(unitId);

       
        assertEquals(200, response.getStatusCode().value());
        List<?> body = (List<?>) response.getBody();
        assertTrue(body.isEmpty());
    }
}
