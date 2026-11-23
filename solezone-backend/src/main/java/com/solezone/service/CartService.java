package com.solezone.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.solezone.entity.Cart;
import com.solezone.entity.CartItem;
import com.solezone.entity.Product;
import com.solezone.entity.User;
import com.solezone.repository.CartItemRepository;
import com.solezone.repository.CartRepository;
import com.solezone.repository.ProductRepository;
import com.solezone.repository.UserRepository;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CartItem addToCart(Integer userId, Integer productId, int quantity) {

        if (quantity < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        List<CartItem> items = cartItemRepository.findByCart(cart);

        for (CartItem item : items) {
            if (item.getProduct().getProductId() == productId) {
                item.setQuantity(item.getQuantity() + quantity);
                return cartItemRepository.save(item);
            }
        }

        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    public List<CartItem> getCartItems(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElse(null);

        if (cart == null) {
            return List.of();
        }

        return cartItemRepository.findByCart(cart);
    }

    @Transactional
    public CartItem decreaseQuantity(Integer userId, Integer productId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCart(cart);

        for (CartItem item : items) {
            if (item.getProduct().getProductId() == productId) {

                if (item.getQuantity() > 1) {
                    item.setQuantity(item.getQuantity() - 1);
                    return cartItemRepository.save(item);
                }

                cartItemRepository.delete(item);
                return null;
            }
        }

        throw new RuntimeException("Cart item not found");
    }

    @Transactional
    public void removeFromCart(Integer userId, Integer productId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCart(cart);

        for (CartItem item : items) {
            if (item.getProduct().getProductId() == productId) {
                cartItemRepository.delete(item);
                return;
            }
        }

        throw new RuntimeException("Cart item not found");
    }
}