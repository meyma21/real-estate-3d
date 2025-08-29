package com.realestate.model;

import java.time.LocalDateTime;

public class Picture {
    private String id;
    private String apartmentId;
    private String url;
    private String type;
    private int order;
    private LocalDateTime createdAt;

    // Default constructor
    public Picture() {
    }

    // Constructor with fields
    public Picture(String id, String apartmentId, String url, String type, int order) {
        this.id = id;
        this.apartmentId = apartmentId;
        this.url = url;
        this.type = type;
        this.order = order;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 