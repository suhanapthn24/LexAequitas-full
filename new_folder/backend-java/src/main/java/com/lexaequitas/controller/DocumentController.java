package com.lexaequitas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.lexaequitas.service.DocumentAnalyzerService;

import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    // private final String UPLOAD_DIR = "uploads/";

    @Autowired
    private DocumentAnalyzerService analyzerService;

    // @PostMapping
    // public ResponseEntity<?> uploadDocument(
    //         @RequestParam("title") String title,
    //         @RequestParam("document_type") String type,
    //         @RequestParam(value = "description", required = false) String description,
    //         @RequestParam("file") MultipartFile file
    // ) {
    //     try {
    //         Path uploadPath = Paths.get("uploads").toAbsolutePath();
    //         Files.createDirectories(uploadPath);

    //         String originalName = Optional.ofNullable(file.getOriginalFilename())
    //                 .orElse("unknown.pdf")
    //                 .replaceAll("\\s+", "_");

    //         String filename = System.currentTimeMillis() + "_" + originalName;

    //         Path filepath = uploadPath.resolve(filename);

    //         System.out.println("Uploading file: " + originalName);
    //         System.out.println("Saving to: " + filepath);

    //         file.transferTo(filepath.toFile()); // ✅ FIXED

    //         return ResponseEntity.ok(Map.of(
    //                 "id", new Random().nextInt(10000),
    //                 "title", title,
    //                 "file_name", filename,
    //                 "document_type", type,
    //                 "description", description,
    //                 "file_size", file.getSize(),
    //                 "created_at", new Date()
    //         ));

    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return ResponseEntity.internalServerError().body(
    //                 Map.of("error", e.getMessage())
    //         );
    //     }
    // }

    @PostMapping
    public ResponseEntity<?> uploadDocument(
            @RequestParam("title") String title,
            @RequestParam("document_type") String type,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            byte[] fileBytes = file.getBytes();
            String analysis = analyzerService.analyseDocument(fileBytes);
            return ResponseEntity.ok(Map.of(
                "message", "success",
                "filename", file.getOriginalFilename(),
                "analysis", analysis
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @GetMapping
    public ResponseEntity<?> getDocuments() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        return ResponseEntity.ok("Deleted");
    }
}