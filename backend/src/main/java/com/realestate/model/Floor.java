package com.realestate.model;

import com.google.cloud.Timestamp;
import java.util.List;
import java.util.Map;
import com.realestate.model.Hotspot;

public class Floor {
    private String id;
    private String name;
    private Integer level;
    private String description;
    private Integer totalApartments;
    private String floorPlanUrl;
    private String model3dUrl;
    private String buildingId;
    private Integer floorNumber;
    private double area;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    // Now supports multiple images per floor
    private List<String> imageUrls;
    // Store only apartment document IDs to avoid heavy nested objects
    private List<String> apartmentIds;

    // New fields for top-view and angle-specific hotspots
    private List<Hotspot> topViewHotspots;
    private Map<String, List<Hotspot>> angleHotspots;

    public Floor() {
    }

    public Floor(String id, String name, Integer level, String description, Integer totalApartments) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.description = description;
        this.totalApartments = totalApartments;
        this.createdAt = Timestamp.now();
        this.updatedAt = Timestamp.now();
    }

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

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalApartments() {
        return totalApartments;
    }

    public void setTotalApartments(Integer totalApartments) {
        this.totalApartments = totalApartments;
    }

    public String getFloorPlanUrl() {
        return floorPlanUrl;
    }

    public void setFloorPlanUrl(String floorPlanUrl) {
        this.floorPlanUrl = floorPlanUrl;
    }

    public String getModel3dUrl() {
        return model3dUrl;
    }

    public void setModel3dUrl(String model3dUrl) {
        this.model3dUrl = model3dUrl;
    }

    public String getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(String buildingId) {
        this.buildingId = buildingId;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public double getArea() {
        return area;
    }

    public void setArea(double area) {
        this.area = area;
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

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public List<String> getApartmentIds() {
        return apartmentIds;
    }

    public void setApartmentIds(List<String> apartmentIds) {
        this.apartmentIds = apartmentIds;
    }

    public List<Hotspot> getTopViewHotspots() {
        return topViewHotspots;
    }

    public void setTopViewHotspots(List<Hotspot> topViewHotspots) {
        this.topViewHotspots = topViewHotspots;
    }

    public Map<String, List<Hotspot>> getAngleHotspots() {
        return angleHotspots;
    }

    public void setAngleHotspots(Map<String, List<Hotspot>> angleHotspots) {
        this.angleHotspots = angleHotspots;
    }
} 