package com.solezone.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.solezone.entity.Cart;
import com.solezone.entity.CartItem;
import com.solezone.entity.Order;
import com.solezone.entity.OrderItem;
import com.solezone.entity.OrderStatus;
import com.solezone.entity.PaymentMethod;
import com.solezone.entity.PaymentStatus;
import com.solezone.entity.Product;
import com.solezone.entity.User;
import com.solezone.repository.CartItemRepository;
import com.solezone.repository.CartRepository;
import com.solezone.repository.OrderItemRepository;
import com.solezone.repository.OrderRepository;
import com.solezone.repository.ProductRepository;
import com.solezone.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order placeOrder(Integer userId, String shippingAddress, PaymentMethod paymentMethod) {

        if (shippingAddress == null || shippingAddress.isBlank()) {
            throw new RuntimeException("Shipping address is required");
        }

        if (paymentMethod == null) {
            throw new RuntimeException("Payment method is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Your cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress.trim());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentMethod(paymentMethod);

        // COD: user pays on delivery. CARD / UPI: simulated as paid.
        if (paymentMethod == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PENDING);
        } else {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            Product product = productRepository.findById(
                    cartItem.getProduct().getProductId())
                    .orElseThrow(() ->
                            new RuntimeException("Product not found"));

            int quantity = cartItem.getQuantity();

            if (quantity <= 0) {
                throw new RuntimeException("Invalid item quantity");
            }

            if (quantity > product.getStockQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for " + product.getProductName());
            }

            BigDecimal price = BigDecimal.valueOf(product.getPrice());

            total = total.add(
                    price.multiply(BigDecimal.valueOf(quantity)));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(price);

            orderItems.add(orderItem);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        for (CartItem item : cartItems) {
            cartItemRepository.delete(item);
        }

        return savedOrder;
    }

    public List<Order> getUserOrders(Integer userId) {
        return orderRepository.findByUser_UserId(userId);
    }

    @Transactional
    public void deleteOrder(Integer orderId, Integer userId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You are not allowed to delete this order");
        }

        orderItemRepository.deleteAll(
                orderItemRepository.findByOrder_OrderId(orderId));

        orderRepository.delete(order);
    }
}