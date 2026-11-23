
package com.solezone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.solezone.entity.Cart;
import com.solezone.entity.CartItem;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    List<CartItem> findByCart(Cart cart);
}
