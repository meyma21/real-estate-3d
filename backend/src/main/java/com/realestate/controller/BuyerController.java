package com.realestate.controller;

import com.realestate.model.Buyer;
import com.realestate.model.BuyerStatus;
import com.realestate.service.BuyerService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/buyers")
@RequiredArgsConstructor
public class BuyerController {
    private final BuyerService buyerService;

    @PostMapping
    public ResponseEntity<String> createBuyer(@RequestBody Buyer buyer) {
        String id = buyerService.createBuyer(buyer);
        return ResponseEntity.ok(id);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Buyer> getBuyerById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Buyer buyer = buyerService.getBuyerById(id);
        return buyer != null ? ResponseEntity.ok(buyer) : ResponseEntity.notFound().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Buyer>> getAllBuyers() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(buyerService.getAllBuyers());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Buyer>> getBuyersByStatus(@PathVariable BuyerStatus status) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(buyerService.getBuyersByStatus(status));
    }

    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Buyer>> getBuyersByApartment(@PathVariable String apartmentId) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(buyerService.getBuyersByApartment(apartmentId));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Buyer>> getBuyersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        var tsStart = com.google.cloud.Timestamp.ofTimeSecondsAndNanos(startDate.toEpochSecond(java.time.ZoneOffset.UTC), 0);
        var tsEnd = com.google.cloud.Timestamp.ofTimeSecondsAndNanos(endDate.toEpochSecond(java.time.ZoneOffset.UTC), 0);
        return ResponseEntity.ok(buyerService.getBuyersByDateRange(tsStart, tsEnd));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateBuyer(@PathVariable String id, @RequestBody Buyer buyer) {
        buyerService.updateBuyer(id, buyer);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBuyer(@PathVariable String id) throws ExecutionException, InterruptedException {
        buyerService.deleteBuyer(id);
        return ResponseEntity.ok().build();
    }
} 