package com.realestate.service;

import com.realestate.model.Apartment;
import com.realestate.model.ApartmentStatus;
import com.realestate.repository.ApartmentRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final FirebaseService firebaseService;

    public ApartmentService(ApartmentRepository apartmentRepository, FirebaseService firebaseService) {
        this.apartmentRepository = apartmentRepository;
        this.firebaseService = firebaseService;
    }

    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }
    
    public Apartment getApartment(String id) {
        return apartmentRepository.findById(id);
    }
    
    public String createApartment(Apartment apartment, MultipartFile modelFile) throws IOException {
        apartment.setCreatedAt(Timestamp.now());
        apartment.setUpdatedAt(Timestamp.now());

        if (modelFile != null && !modelFile.isEmpty()) {
            String modelUrl = firebaseService.uploadFile(modelFile);
            apartment.setModel3dUrl(modelUrl);
        }

        return apartmentRepository.save(apartment);
    }
    
    public void updateApartment(String id, Apartment apartment, MultipartFile modelFile) throws IOException {
        apartment.setId(id);
        apartment.setUpdatedAt(Timestamp.now());

        if (modelFile != null && !modelFile.isEmpty()) {
            // Delete old model if exists
            Apartment existingApartment = apartmentRepository.findById(id);
            if (existingApartment != null && existingApartment.getModel3dUrl() != null) {
                firebaseService.deleteFile(existingApartment.getModel3dUrl());
            }

            // Upload new model
            String modelUrl = firebaseService.uploadFile(modelFile);
            apartment.setModel3dUrl(modelUrl);
        }

        apartmentRepository.update(id, apartment);
    }

    public void deleteApartment(String id) {
        Apartment apartment = apartmentRepository.findById(id);
        if (apartment != null && apartment.getModel3dUrl() != null) {
            firebaseService.deleteFile(apartment.getModel3dUrl());
        }
        apartmentRepository.delete(id);
    }

    public List<Apartment> getApartmentsByStatus(ApartmentStatus status) {
        return apartmentRepository.findByField("status", status);
    }

    public List<Apartment> getApartmentsByFloorId(String floorId) {
        return apartmentRepository.findByField("floorId", floorId);
    }

    public List<Apartment> getApartmentsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        // TODO: Implement price range query using Firestore compound queries
        return apartmentRepository.findAll().stream()
            .filter(apt -> apt.getPrice().compareTo(minPrice) >= 0 && apt.getPrice().compareTo(maxPrice) <= 0)
            .toList();
    }

    public List<Apartment> getApartmentsByType(String type) {
        return apartmentRepository.findByField("type", type);
    }
} 