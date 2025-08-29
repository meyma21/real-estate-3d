package com.realestate.service;

import com.realestate.model.Picture;
import com.realestate.repository.FirebaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.time.LocalDateTime;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class PictureService {
    private final FirebaseRepository<Picture> pictureRepository;
    private final FirebaseService firebaseService;

    public PictureService(FirebaseRepository<Picture> pictureRepository, FirebaseService firebaseService) {
        this.pictureRepository = pictureRepository;
        this.firebaseService = firebaseService;
    }

    public String createPicture(Picture picture, MultipartFile file) throws IOException {
        // Upload image to Firebase Storage
        String imageUrl = firebaseService.uploadFile(file);
        picture.setUrl(imageUrl);
        picture.setCreatedAt(LocalDateTime.now());
        
        return pictureRepository.save(picture);
    }

    public void deletePicture(String id) {
        Picture picture = pictureRepository.findById(id);
        if (picture != null && picture.getUrl() != null) {
            // Delete from Firebase Storage
            firebaseService.deleteFile(picture.getUrl());
        }
        pictureRepository.delete(id);
    }

    public List<Picture> getPicturesByApartment(String apartmentId) {
        return pictureRepository.findByField("apartmentId", apartmentId);
    }

    public void reorderPictures(String apartmentId, List<String> pictureIds) {
        AtomicInteger counter = new AtomicInteger(0);
        pictureIds.forEach(pictureId -> {
            getPicturesByApartment(apartmentId).stream()
                .filter(p -> p.getId().equals(pictureId))
                .findFirst()
                .ifPresent(picture -> {
                    picture.setOrder(counter.getAndIncrement());
                    pictureRepository.update(pictureId, picture);
                });
        });
    }

    public List<Picture> getAllPictures() {
        return pictureRepository.findAll();
    }

    public Picture getPicture(String id) {
        return pictureRepository.findById(id);
    }

    public List<Picture> getPicturesByApartmentId(String apartmentId) {
        return pictureRepository.findByField("apartmentId", apartmentId);
    }

    public void uploadPictures(String apartmentId, List<MultipartFile> files) throws IOException {
        AtomicInteger order = new AtomicInteger(0);
        
        // Get existing pictures to determine the next order number
        List<Picture> existingPictures = getPicturesByApartmentId(apartmentId);
        if (!existingPictures.isEmpty()) {
            int maxOrder = existingPictures.stream()
                .mapToInt(Picture::getOrder)
                .max()
                .orElse(-1);
            order.set(maxOrder + 1);
        }

        // Upload new pictures
        for (MultipartFile file : files) {
            String imageUrl = firebaseService.uploadFile(file);
            
            Picture picture = new Picture();
            picture.setApartmentId(apartmentId);
            picture.setUrl(imageUrl);
            picture.setOrder(order.getAndIncrement());
            
            pictureRepository.save(picture);
        }
    }

    public void updatePictureOrder(List<String> pictureIds) {
        AtomicInteger counter = new AtomicInteger(0);
        pictureIds.forEach(id -> {
            Picture picture = pictureRepository.findById(id);
            if (picture != null) {
                picture.setOrder(counter.getAndIncrement());
                pictureRepository.update(id, picture);
            }
        });
    }

    public void deleteAllPicturesForApartment(String apartmentId) {
        List<Picture> pictures = getPicturesByApartmentId(apartmentId);
        for (Picture picture : pictures) {
            if (picture.getUrl() != null) {
                firebaseService.deleteFile(picture.getUrl());
            }
            pictureRepository.delete(picture.getId());
        }
    }
} 