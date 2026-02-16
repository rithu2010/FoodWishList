package com.example.foodwishlistmanager.controller;

import com.example.foodwishlistmanager.dto.FoodWishlistRequest;
import com.example.foodwishlistmanager.entity.FoodWishlistItem;
import com.example.foodwishlistmanager.service.FoodWishlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/foods")
@CrossOrigin(origins = "*")
public class FoodWishlistController {

    private final FoodWishlistService service;

    public FoodWishlistController(FoodWishlistService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FoodWishlistItem> create(@Valid @RequestBody FoodWishlistRequest request) {
        FoodWishlistItem created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<FoodWishlistItem> getAll() {
        return service.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodWishlistItem> update(@PathVariable Long id,
                                                   @Valid @RequestBody FoodWishlistRequest request) {
        FoodWishlistItem updated = service.update(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return errors;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }
}

