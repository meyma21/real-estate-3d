package com.realestate.controller;

import com.realestate.model.Apartment;
import com.realestate.model.ApartmentStatus;
import com.realestate.service.ApartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/apartments")
public class ApartmentController {
    private final ApartmentService apartmentService;
    
    public ApartmentController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }
    
    @GetMapping
    public ResponseEntity<List<Apartment>> getAllApartments() {
        return ResponseEntity.ok(apartmentService.getAllApartments());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Apartment> getApartment(@PathVariable String id) {
        Apartment apartment = apartmentService.getApartment(id);
        return apartment != null ? ResponseEntity.ok(apartment) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<String> createApartment(@RequestPart("apartment") Apartment apartment,
                                                @RequestPart(value = "model", required = false) MultipartFile modelFile) throws IOException {
        String id = apartmentService.createApartment(apartment, modelFile);
        return ResponseEntity.ok(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateApartment(@PathVariable String id,
                                              @RequestPart("apartment") Apartment apartment,
                                              @RequestPart(value = "model", required = false) MultipartFile modelFile) throws IOException {
        apartmentService.updateApartment(id, apartment, modelFile);
        return ResponseEntity.ok().build();
    }

    // Simple JSON-based endpoints for management system
    @PostMapping("/simple")
    public ResponseEntity<Apartment> createApartmentSimple(@RequestBody Apartment apartment) {
        try {
            String id = apartmentService.createApartment(apartment, null);
            apartment.setId(id);
            return ResponseEntity.ok(apartment);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/simple")
    public ResponseEntity<Apartment> updateApartmentSimple(@PathVariable String id, @RequestBody Apartment apartment) {
        try {
            apartmentService.updateApartment(id, apartment, null);
            apartment.setId(id);
            return ResponseEntity.ok(apartment);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApartment(@PathVariable String id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Apartment>> getApartmentsByStatus(@PathVariable ApartmentStatus status) {
        return ResponseEntity.ok(apartmentService.getApartmentsByStatus(status));
    }

    @GetMapping("/floor/{floorId}")
    public ResponseEntity<List<Apartment>> getApartmentsByFloor(@PathVariable String floorId) {
        return ResponseEntity.ok(apartmentService.getApartmentsByFloorId(floorId));
    }

    @GetMapping("/price")
    public ResponseEntity<List<Apartment>> getApartmentsByPriceRange(@RequestParam BigDecimal minPrice,
                                                                    @RequestParam BigDecimal maxPrice) {
        return ResponseEntity.ok(apartmentService.getApartmentsByPriceRange(minPrice, maxPrice));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Apartment>> getApartmentsByType(@PathVariable String type) {
        return ResponseEntity.ok(apartmentService.getApartmentsByType(type));
    }
} 