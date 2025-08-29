package com.realestate.model;

import com.google.cloud.Timestamp;
import java.math.BigDecimal;
import java.util.List;

public class Apartment {
    private String id;
    private String floorId;
    private String lotNumber;
    private String type;
    private double area;
    private BigDecimal price;
    private ApartmentStatus status;
    private String description;
    private List<String> mediaUrls;
    private String model3dUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Apartment() {
    }

    public Apartment(String id, String floorId, String lotNumber, String type, double area, BigDecimal price, ApartmentStatus status, String description) {
        this.id = id;
        this.floorId = floorId;
        this.lotNumber = lotNumber;
        this.type = type;
        this.area = area;
        this.price = price;
        this.status = status;
        this.description = description;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFloorId() {
        return floorId;
    }

    public void setFloorId(String floorId) {
        this.floorId = floorId;
    }

    public String getLotNumber() {
        return lotNumber;
    }

    public void setLotNumber(String lotNumber) {
        this.lotNumber = lotNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getArea() {
        return area;
    }

    public void setArea(double area) {
        this.area = area;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public ApartmentStatus getStatus() {
        return status;
    }

    public void setStatus(ApartmentStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public String getModel3dUrl() {
        return model3dUrl;
    }

    public void setModel3dUrl(String model3dUrl) {
        this.model3dUrl = model3dUrl;
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