package com.solezone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.solezone.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

}
