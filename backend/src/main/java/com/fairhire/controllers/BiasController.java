package com.fairhire.controllers;

import com.fairhire.services.BiasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class BiasController {

    private final BiasService biasService;

    public BiasController(BiasService biasService) {
        this.biasService = biasService;
    }

    @PostMapping({"/api/bias/analyze", "/api/analyze-jd"})
    public ResponseEntity<?> analyze(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", body.get("jd_text"));
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required."));
        }
        Map<String, Object> rawResult = biasService.analyzeText(text);
        if ("SERVICE_UNAVAILABLE".equals(rawResult.get("status"))) {
            return ResponseEntity.status(503).body(rawResult);
        }
        Map<String, Object> result = new LinkedHashMap<>(rawResult);
        if (result.containsKey("flagged_words") && !result.containsKey("flagged_terms")) {
            List<?> words = (List<?>) result.get("flagged_words");
            List<Map<String, Object>> terms = new ArrayList<>();
            for (Object obj : words) {
                if (obj instanceof Map<?, ?> m) {
                    Map<String, Object> term = new LinkedHashMap<>();
                    term.put("word", m.get("word"));
                    Object alt = m.containsKey("suggestions") ? m.get("suggestions") : m.get("replacement");
                    term.put("neutral_alternative", alt != null ? String.valueOf(alt) : "");
                    term.put("category", m.get("category"));
                    terms.add(term);
                }
            }
            result.put("flagged_terms", terms);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/bias/{jobId}")
    public ResponseEntity<?> getBiasReport(@PathVariable Long jobId) {
        try {
            return ResponseEntity.ok(biasService.getJobBiasReport(jobId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/bias/rewrite")
    public ResponseEntity<?> rewrite(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", body.get("jd_text"));
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required."));
        }
        return ResponseEntity.ok(biasService.rewriteText(text));
    }
}
