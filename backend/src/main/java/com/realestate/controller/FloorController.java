package com.realestate.controller;

import com.realestate.model.Floor;
import com.realestate.service.FloorService;
import com.realestate.service.FirebaseService;
import com.realestate.dto.HotspotUpdateRequest;
import com.realestate.dto.FloorImageInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/floors")
public class FloorController {
    private final FloorService floorService;
    private final FirebaseService firebaseService;

    public FloorController(FloorService floorService, FirebaseService firebaseService) {
        this.floorService = floorService;
        this.firebaseService = firebaseService;
    }
    
    @GetMapping
    public ResponseEntity<List<Floor>> getAllFloors() {
            return ResponseEntity.ok(floorService.getAllFloors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Floor> getFloor(@PathVariable String id) {
        Floor floor = floorService.getFloor(id);
        if (floor != null) {
            return ResponseEntity.ok(floor);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}/images")
    public ResponseEntity<List<String>> getFloorImages(@PathVariable String id) {
        try {
            List<String> imageUrls = firebaseService.getFloorImages(id);
            return ResponseEntity.ok(imageUrls);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<List<String>> uploadFloorImages(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            List<String> uploadedUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                String fileName = "floors/" + id + "/" + file.getOriginalFilename();
                String url = firebaseService.uploadFileToPath(file, fileName);
                uploadedUrls.add(url);
            }
            return ResponseEntity.ok(uploadedUrls);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<String> createFloor(
            @RequestPart("floor") Floor floor,
            @RequestPart(value = "model", required = false) MultipartFile modelFile) {
        try {
            String id = floorService.createFloor(floor, modelFile);
            return ResponseEntity.ok(id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFloor(
            @PathVariable String id,
            @RequestPart("floor") Floor floor,
            @RequestPart(value = "model", required = false) MultipartFile modelFile) {
        try {
            floorService.updateFloor(id, floor, modelFile);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Simple JSON-based endpoints for management system
    @PostMapping("/simple")
    public ResponseEntity<Floor> createFloorSimple(@RequestBody Floor floor) {
        try {
            String id = floorService.createFloor(floor, null);
            floor.setId(id);
            return ResponseEntity.ok(floor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/simple")
    public ResponseEntity<Floor> updateFloorSimple(@PathVariable String id, @RequestBody Floor floor) {
        try {
            floorService.updateFloor(id, floor, null);
            floor.setId(id);
            return ResponseEntity.ok(floor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/hotspots")
    public ResponseEntity<Void> updateFloorHotspots(@PathVariable String id, @RequestBody HotspotUpdateRequest request) {
        try {
            floorService.updateHotspots(id, request.getTopViewHotspots(), request.getAngleHotspots());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFloor(@PathVariable String id) {
        floorService.deleteFloor(id);
        return ResponseEntity.ok().build();
        }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Floor>> getFloorsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(floorService.getFloorsByStatus(status));
    }

    // ========== FLOOR IMAGE MANAGEMENT ENDPOINTS ==========

    @GetMapping("/{id}/images/details")
    public ResponseEntity<List<FloorImageInfo>> getFloorImageDetails(@PathVariable String id) {
        try {
            List<FloorImageInfo> imageInfos = firebaseService.getFloorImageDetails(id);
            return ResponseEntity.ok(imageInfos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/images/upload")
    public ResponseEntity<Map<String, Object>> uploadFloorImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "fileName", required = false) String customFileName) {
        try {
            String downloadUrl = firebaseService.uploadFloorImage(id, file, customFileName);
            FloorImageInfo imageInfo = firebaseService.getFloorImageInfo(id, 
                customFileName != null ? customFileName : file.getOriginalFilename());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("downloadUrl", downloadUrl);
            response.put("imageInfo", imageInfo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/{id}/images/upload-multiple")
    public ResponseEntity<Map<String, Object>> uploadMultipleFloorImages(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            List<Map<String, Object>> uploadedImages = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            for (MultipartFile file : files) {
                try {
                    String downloadUrl = firebaseService.uploadFloorImage(id, file, null);
                    FloorImageInfo imageInfo = firebaseService.getFloorImageInfo(id, file.getOriginalFilename());
                    
                    Map<String, Object> uploadResult = new HashMap<>();
                    uploadResult.put("fileName", file.getOriginalFilename());
                    uploadResult.put("downloadUrl", downloadUrl);
                    uploadResult.put("imageInfo", imageInfo);
                    uploadedImages.add(uploadResult);
                    
                } catch (Exception e) {
                    errors.add("Failed to upload " + file.getOriginalFilename() + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", errors.isEmpty());
            response.put("uploadedImages", uploadedImages);
            response.put("uploadedCount", uploadedImages.size());
            response.put("totalCount", files.size());
            if (!errors.isEmpty()) {
                response.put("errors", errors);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}/images/{fileName}")
    public ResponseEntity<Map<String, Object>> deleteFloorImage(
            @PathVariable String id,
            @PathVariable String fileName) {
        try {
            boolean success = firebaseService.deleteFloorImage(id, fileName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Image deleted successfully" : "Failed to delete image");
            
            return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}/images/{fileName}/rename")
    public ResponseEntity<Map<String, Object>> renameFloorImage(
            @PathVariable String id,
            @PathVariable String fileName,
            @RequestParam("newFileName") String newFileName) {
        try {
            boolean success = firebaseService.renameFloorImage(id, fileName, newFileName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Image renamed successfully" : "Failed to rename image");
            if (success) {
                FloorImageInfo updatedImageInfo = firebaseService.getFloorImageInfo(id, newFileName);
                response.put("imageInfo", updatedImageInfo);
            }
            
            return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}/images/{fileName}/info")
    public ResponseEntity<FloorImageInfo> getFloorImageInfo(
            @PathVariable String id,
            @PathVariable String fileName) {
        try {
            FloorImageInfo imageInfo = firebaseService.getFloorImageInfo(id, fileName);
            if (imageInfo != null) {
                return ResponseEntity.ok(imageInfo);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 