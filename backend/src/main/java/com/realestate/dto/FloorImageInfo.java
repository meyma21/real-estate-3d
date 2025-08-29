package com.realestate.dto;

import java.time.Instant;

public class FloorImageInfo {
    private String name;
    private String fullPath;
    private String downloadUrl;
    private long size;
    private String contentType;
    private Instant uploadDate;
    private boolean isImage;

    public FloorImageInfo() {
    }

    public FloorImageInfo(String name, String fullPath, String downloadUrl, long size, String contentType, Instant uploadDate, boolean isImage) {
        this.name = name;
        this.fullPath = fullPath;
        this.downloadUrl = downloadUrl;
        this.size = size;
        this.contentType = contentType;
        this.uploadDate = uploadDate;
        this.isImage = isImage;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullPath() {
        return fullPath;
    }

    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Instant getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Instant uploadDate) {
        this.uploadDate = uploadDate;
    }

    public boolean isImage() {
        return isImage;
    }

    public void setImage(boolean image) {
        isImage = image;
    }
}
