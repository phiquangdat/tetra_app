package com.tetra.app.controller;

import com.tetra.app.model.UnitContent;
import com.tetra.app.repository.UnitContentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

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
        // Arrange
        UnitContent content1 = new UnitContent(null, 1, "text", "Title 1", "Content 1", "http://example.com/1");
        UnitContent content2 = new UnitContent(null, 2, "video", "Title 2", "Content 2", "http://example.com/2");
        List<UnitContent> mockUnitContent = List.of(content1, content2);

        when(unitContentRepository.findAll()).thenReturn(mockUnitContent);

        // Act
        ResponseEntity<List<UnitContent>> response = unitContentController.getAll();

        // Assert
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(unitContentRepository, times(1)).findAll();
    }
}
