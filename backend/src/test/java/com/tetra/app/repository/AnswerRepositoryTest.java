package com.tetra.app.repository;

import com.tetra.app.model.Answer;
import com.tetra.app.model.Question;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@DataJpaTest
class AnswerRepositoryTest {

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Test
    void testSaveAndFindByIdAndByQuestionId() {
        // Arrange: create and save a question
        Question question = new Question();
        question.setTitle("Q1");
        question.setType("single");
        question.setSortOrder(1);
        question = questionRepository.save(question);

        // Arrange: create and save an answer
        Answer answer = new Answer();
        answer.setQuestion(question);
        answer.setTitle("Answer 1");
        answer.setIsCorrect(true);
        answer.setSortOrder(1);
        Answer saved = answerRepository.save(answer);

        // Act & Assert: find by id
        Answer found = answerRepository.findById(saved.getId()).orElse(null);
        assertNotNull(found);
        assertEquals("Answer 1", found.getTitle());
        assertEquals(question.getId(), found.getQuestionId());

        // Act & Assert: find by questionId
        List<Answer> byQuestion = answerRepository.findByQuestion_Id(question.getId());
        assertFalse(byQuestion.isEmpty());
        assertEquals("Answer 1", byQuestion.get(0).getTitle());
    }

    @Test
    void testDeleteAnswer() {
        Question question = new Question();
        question.setTitle("Q2");
        question.setType("single");
        question.setSortOrder(2);
        question = questionRepository.save(question);

        Answer answer = new Answer();
        answer.setQuestion(question);
        answer.setTitle("To Delete");
        answer.setIsCorrect(false);
        answer.setSortOrder(2);
        Answer saved = answerRepository.save(answer);

        answerRepository.delete(saved);
        assertFalse(answerRepository.findById(saved.getId()).isPresent());
    }
}
