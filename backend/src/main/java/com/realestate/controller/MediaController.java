package com.realestate.controller;

import com.realestate.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
    private final MediaService mediaService;

    @PostMapping("/upload/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable String type) throws IOException {
        
        String folder = type.equals("3d") ? "models" : "images";
        String fileUrl = mediaService.uploadFile(file, folder);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("type", type);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{type}/{fileName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFile(
            @PathVariable String type,
            @PathVariable String fileName) {
        
        String folder = type.equals("3d") ? "models" : "images";
        String filePath = folder + "/" + fileName;
        
        mediaService.deleteFile(filePath);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/url/{type}/{fileName}")
    public ResponseEntity<Map<String, String>> getFileUrl(
            @PathVariable String type,
            @PathVariable String fileName) {
        
        String folder = type.equals("3d") ? "models" : "images";
        String filePath = folder + "/" + fileName;
        
        String signedUrl = mediaService.getSignedUrl(filePath);
        
        if (signedUrl != null) {
            Map<String, String> response = new HashMap<>();
            response.put("url", signedUrl);
            response.put("type", type);
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/exists/{type}/{fileName}")
    public ResponseEntity<Map<String, Boolean>> checkFileExists(
            @PathVariable String type,
            @PathVariable String fileName) {
        
        String folder = type.equals("3d") ? "models" : "images";
        String filePath = folder + "/" + fileName;
        
        boolean exists = mediaService.isFileExists(filePath);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        
        return ResponseEntity.ok(response);
    }
} 