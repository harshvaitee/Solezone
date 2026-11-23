package com.solezone.controller;

import com.solezone.entity.Order;
import com.solezone.entity.PaymentMethod;
import com.solezone.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            @RequestParam Integer userId,
            @RequestBody Map<String, String> request) {

        try {
            String shippingAddress = request.get("shippingAddress");
            String paymentMethodValue = request.get("paymentMethod");

            if (paymentMethodValue == null || paymentMethodValue.isBlank()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Payment method is required")
                );
            }

            PaymentMethod paymentMethod;
            try {
                paymentMethod = PaymentMethod.valueOf(
                        paymentMethodValue.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Invalid payment method. Use COD, CARD or UPI")
                );
            }

            Order order = orderService.placeOrder(
                    userId, shippingAddress, paymentMethod
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Order placed successfully",
                    "orderId", order.getOrderId(),
                    "totalAmount", order.getTotalAmount(),
                    "status", order.getOrderStatus().name(),
                    "paymentMethod", order.getPaymentMethod().name(),
                    "paymentStatus", order.getPaymentStatus().name()
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                orderService.getUserOrders(userId)
        );
    }

    @DeleteMapping("/{orderId}/user/{userId}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable Integer orderId,
            @PathVariable Integer userId) {

        try {
            orderService.deleteOrder(orderId, userId);

            return ResponseEntity.ok(
                    Map.of("message", "Order deleted successfully")
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
}