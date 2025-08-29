package com.realestate.service;

import com.google.cloud.Timestamp;
import com.realestate.model.Buyer;
import com.realestate.model.BuyerStatus;
import com.realestate.repository.BuyerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BuyerService {
    private final BuyerRepository buyerRepository;

    public BuyerService(BuyerRepository buyerRepository) {
        this.buyerRepository = buyerRepository;
    }

    public String createBuyer(Buyer buyer) {
        buyer.setCreatedAt(Timestamp.now());
        buyer.setUpdatedAt(Timestamp.now());
        return buyerRepository.save(buyer);
    }

    public Buyer getBuyerById(String id) {
        return buyerRepository.findById(id);
    }

    public List<Buyer> getAllBuyers() {
        return buyerRepository.findAll();
    }

    public List<Buyer> getBuyersByStatus(BuyerStatus status) {
        return buyerRepository.findByField("status", status);
    }

    public List<Buyer> getBuyersByApartment(String apartmentId) {
        return buyerRepository.findByField("interestedApartmentId", apartmentId);
    }

    public void updateBuyer(String id, Buyer buyer) {
        buyer.setUpdatedAt(Timestamp.now());
        buyerRepository.update(id, buyer);
    }

    public void deleteBuyer(String id) {
        buyerRepository.delete(id);
    }

    public List<Buyer> getBuyersByDateRange(Timestamp startDate, Timestamp endDate) {
        // Note: Firebase doesn't support range queries directly
        // You might need to implement this differently based on your requirements
        List<Buyer> allBuyers = getAllBuyers();
        return allBuyers.stream()
            .filter(buyer -> buyer.getCreatedAt().getSeconds() >= startDate.getSeconds() 
                && buyer.getCreatedAt().getSeconds() <= endDate.getSeconds())
            .toList();
    }
} 