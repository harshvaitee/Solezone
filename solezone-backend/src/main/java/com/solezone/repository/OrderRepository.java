
package com.solezone.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.solezone.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUser_UserId(Integer userId);
}
