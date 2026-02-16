package com.example.foodwishlistmanager.service;

import com.example.foodwishlistmanager.dto.FoodWishlistRequest;
import com.example.foodwishlistmanager.entity.FoodWishlistItem;
import com.example.foodwishlistmanager.repository.FoodWishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class FoodWishlistService {

    private final FoodWishlistRepository repository;

    public FoodWishlistService(FoodWishlistRepository repository) {
        this.repository = repository;
    }

    public FoodWishlistItem create(FoodWishlistRequest request) {
        FoodWishlistItem item = new FoodWishlistItem();
        item.setFoodName(request.getFoodName());
        item.setRestaurantName(request.getRestaurantName());
        item.setRating(request.getRating());
        item.setDateAdded(LocalDateTime.now());
        return repository.save(item);
    }

    @Transactional(readOnly = true)
    public List<FoodWishlistItem> findAll() {
        return repository.findAll();
    }

    public FoodWishlistItem update(Long id, FoodWishlistRequest request) {
        FoodWishlistItem item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found with id " + id));

        item.setFoodName(request.getFoodName());
        item.setRestaurantName(request.getRestaurantName());
        item.setRating(request.getRating());

        return repository.save(item);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Food item not found with id " + id);
        }
        repository.deleteById(id);
    }
}

