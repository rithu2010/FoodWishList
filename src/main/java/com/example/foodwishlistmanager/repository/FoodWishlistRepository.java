package com.example.foodwishlistmanager.repository;

import com.example.foodwishlistmanager.entity.FoodWishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodWishlistRepository extends JpaRepository<FoodWishlistItem, Long> {
}

