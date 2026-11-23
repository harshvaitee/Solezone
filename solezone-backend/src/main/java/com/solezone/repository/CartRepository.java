
package com.solezone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.solezone.entity.Cart;
import com.solezone.entity.User;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findByUser(User user);
}
