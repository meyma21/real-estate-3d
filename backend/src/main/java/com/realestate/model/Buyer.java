package com.realestate.model;

import com.google.cloud.Timestamp;
import java.util.List;

public class Buyer {
    private String id;
    private String name;
    private String email;
    private String phone;
    private BuyerStatus status;
    private List<String> interestedApartmentIds;
    private Double budget;
    private String notes;
    private Timestamp contactDate;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BuyerStatus getStatus() {
        return status;
    }

    public void setStatus(BuyerStatus status) {
        this.status = status;
    }

    public List<String> getInterestedApartmentIds() {
        return interestedApartmentIds;
    }

    public void setInterestedApartmentIds(List<String> interestedApartmentIds) {
        this.interestedApartmentIds = interestedApartmentIds;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Timestamp getContactDate() {
        return contactDate;
    }

    public void setContactDate(Timestamp contactDate) {
        this.contactDate = contactDate;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
} 