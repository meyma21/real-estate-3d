package com.realestate.service;

import com.realestate.model.Floor;
import com.realestate.repository.FirebaseRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.time.LocalDateTime;
import java.io.IOException;
import java.util.Map;
import com.realestate.model.Hotspot;

@Service
public class FloorService {
    private final FirebaseRepository<Floor> repository;
    private final FirebaseService firebaseService;

    public FloorService(FirebaseRepository<Floor> repository, FirebaseService firebaseService) {
        this.repository = repository;
        this.firebaseService = firebaseService;
    }

    public String createFloor(Floor floor, MultipartFile modelFile) throws IOException {
        floor.setCreatedAt(Timestamp.now());
        floor.setUpdatedAt(Timestamp.now());

        if (modelFile != null && !modelFile.isEmpty()) {
            String modelUrl = firebaseService.uploadFile(modelFile);
            floor.setModel3dUrl(modelUrl);
        }

        return repository.save(floor);
    }

    public void updateFloor(String id, Floor floor, MultipartFile modelFile) throws IOException {
        floor.setId(id);
        floor.setUpdatedAt(Timestamp.now());

        if (modelFile != null && !modelFile.isEmpty()) {
            // Delete old model if exists
            Floor existingFloor = repository.findById(id);
            if (existingFloor != null && existingFloor.getModel3dUrl() != null) {
                firebaseService.deleteFile(existingFloor.getModel3dUrl());
            }

            // Upload new model
            String modelUrl = firebaseService.uploadFile(modelFile);
            floor.setModel3dUrl(modelUrl);
        }

        repository.update(id, floor);
    }

    public void deleteFloor(String id) {
        Floor floor = repository.findById(id);
        if (floor != null && floor.getModel3dUrl() != null) {
            firebaseService.deleteFile(floor.getModel3dUrl());
        }
        repository.delete(id);
    }

    public Floor getFloor(String id) {
        return repository.findById(id);
    }

    public List<Floor> getAllFloors() {
        return repository.findAll();
    }

    public List<Floor> getFloorsByStatus(String status) {
        return repository.findByField("status", status);
    }

    public void updateHotspots(String id, List<Hotspot> topView, Map<String, List<Hotspot>> angleHotspots) {
        Floor floor = repository.findById(id);
        if (floor == null) return;
        if (topView != null) {
            floor.setTopViewHotspots(topView);
        }
        if (angleHotspots != null) {
            floor.setAngleHotspots(angleHotspots);
        }
        floor.setUpdatedAt(Timestamp.now());
        repository.update(id, floor);
    }
} 