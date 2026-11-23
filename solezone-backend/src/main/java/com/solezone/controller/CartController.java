package com.solezone.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.solezone.entity.CartItem;
import com.solezone.service.CartService;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(
            @RequestParam Integer userId,
            @RequestParam Integer productId,
            @RequestParam(defaultValue = "1") int quantity) {

        return ResponseEntity.ok(
                cartService.addToCart(userId, productId, quantity));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getCartItems(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                cartService.getCartItems(userId));
    }

    @PutMapping("/decrease")
    public ResponseEntity<?> decreaseQuantity(
            @RequestParam Integer userId,
            @RequestParam Integer productId) {

        CartItem item = cartService.decreaseQuantity(userId, productId);
        return ResponseEntity.ok().body(
                item == null ? "Item removed from cart" : item
        );
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeFromCart(
            @RequestParam Integer userId,
            @RequestParam Integer productId) {

        cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok("Item removed from cart");
    }
}