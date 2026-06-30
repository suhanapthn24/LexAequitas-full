package com.lexaequitas.repository;

import com.lexaequitas.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByOrderByUploadedAtDesc();
    List<Document> findByUserEmailOrderByUploadedAtDesc(String userEmail);
}
