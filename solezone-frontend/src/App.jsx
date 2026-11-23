import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/api/products'
const CART_API_URL = 'http://localhost:8080/api/cart'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [orders, setOrders] = useState([])
  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [authHeader, setAuthHeader] = useState('')

  const [shippingAddress, setShippingAddress] = useState('')
  const [orderMessage, setOrderMessage] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [productName, setProductName] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('1')
  const [editId, setEditId] = useState(null)

  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  function getProducts() {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not load products')
        }
        return response.json()
      })
      .then(data => setProducts(data))
      .catch(error => {
        console.error(error)
        alert('Could not load shoes. Please check that Spring Boot is running.')
      })
      .finally(() => setLoading(false))
  }

  async function loadCart(userId, currentAuthHeader) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/${userId}`,
        {
          headers: {
            Authorization: currentAuthHeader || authHeader
          }
        }
      )

      if (!response.ok) {
        throw new Error('Could not load cart')
      }

      const data = await response.json()

      const cartProducts = data.map(item => ({
        ...item.product,
        quantity: item.quantity
      }))

      setCart(cartProducts)
    } catch (error) {
      console.error('Cart loading error:', error)
      alert('Could not load your saved cart.')
    }
  }

  async function loadOrders(userId) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/user/${userId}`,
        {
          headers: {
            Authorization: authHeader
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Could not load orders: ${response.status}`)
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Order history error:', error)
      alert(error.message || 'Could not load your orders.')
    }
  }

  async function deleteOrder(orderId) {
    if (!loggedInUser || !authHeader) {
      alert("Please log in first");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/${orderId}/user/${loggedInUser.userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authHeader
          }
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not delete order");
      }

      setOrders((previousOrders) =>
        previousOrders.filter((order) => order.orderId !== orderId)
      );

      alert("Order deleted successfully");
    } catch (error) {
      alert(error.message || "Could not delete order");
    }
  }

  useEffect(() => {
    getProducts()
  }, [])

  async function addToCart(product) {
    if (!loggedInUser) {
      alert('Please log in before adding shoes to your cart.')
      setShowLogin(true)
      setShowRegister(false)
      setShowCart(false)
      setShowOrders(false)
      return
    }

    if (Number(product.stockQuantity) <= 0) {
      alert('Sorry, this shoe is out of stock.')
      return
    }

    try {
      const response = await fetch(
        `${CART_API_URL}/add?userId=${loggedInUser.userId}&productId=${product.productId}&quantity=1`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader
          }
        }
      )

      if (!response.ok) {
        throw new Error('Could not add shoe to cart.')
      }

      const existingItem = cart.find(
        item => item.productId === product.productId
      )

      if (existingItem) {
        if (existingItem.quantity >= Number(product.stockQuantity)) {
          alert('The cart was updated, but please check the available stock.')
        }

        setCart(currentCart =>
          currentCart.map(item =>
            item.productId === product.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        )
      } else {
        setCart(currentCart => [
          ...currentCart,
          { ...product, quantity: 1 }
        ])
      }

      alert(`${product.productName} added to cart!`)
    } catch (error) {
      console.error(error)
      alert('Could not add shoe to cart. Please check the backend.')
    }
  }

  async function increaseQuantity(productId) {
    if (!loggedInUser) {
      alert('Please log in first.')
      return
    }

    const item = cart.find(
      item => item.productId === productId
    )

    if (!item) {
      return
    }

    if (item.quantity >= Number(item.stockQuantity)) {
      alert('Sorry, no more stock is available.')
      return
    }

    try {
      const response = await fetch(
        `${CART_API_URL}/add?userId=${loggedInUser.userId}&productId=${productId}&quantity=1`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader
          }
        }
      )

      if (!response.ok) {
        throw new Error('Could not update quantity.')
      }

      setCart(currentCart =>
        currentCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } catch (error) {
      console.error(error)
      alert('Could not increase quantity. Please try again.')
    }
  }

  async function decreaseQuantity(productId) {
    if (!loggedInUser) {
      alert('Please log in first.')
      return
    }

    try {
      const response = await fetch(
        `${CART_API_URL}/decrease?userId=${loggedInUser.userId}&productId=${productId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: authHeader
          }
        }
      )

      if (!response.ok) {
        throw new Error('Could not decrease quantity.')
      }

      await loadCart(loggedInUser.userId, authHeader)
    } catch (error) {
      console.error(error)
      alert('Could not decrease quantity. Please try again.')
    }
  }

  async function removeFromCart(productId) {
    if (!loggedInUser) {
      alert('Please log in first.')
      return
    }

    try {
      const response = await fetch(
        `${CART_API_URL}/remove?userId=${loggedInUser.userId}&productId=${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: authHeader
          }
        }
      )

      if (!response.ok) {
        throw new Error('Could not remove shoe from cart.')
      }

      await loadCart(loggedInUser.userId, authHeader)
      alert('Shoe removed from cart!')
    } catch (error) {
      console.error(error)
      alert('Could not remove shoe. Please try again.')
    }
  }

  async function placeOrder() {
    if (!loggedInUser) {
      alert('Please log in first.')
      return
    }

    if (cart.length === 0) {
      alert('Your cart is empty.')
      return
    }

    if (!shippingAddress.trim()) {
      alert('Please enter your shipping address.')
      return
    }

    setPlacingOrder(true)
    setOrderMessage('')

    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/place?userId=${loggedInUser.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          },
          body: JSON.stringify({
            shippingAddress: shippingAddress
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not place order.')
      }

      setOrderMessage(
        `Order placed successfully! Order ID: ${data.orderId}. Total: ₹${data.totalAmount}`
      )

      setCart([])
      setShippingAddress('')
    } catch (error) {
      console.error(error)
      alert(error.message || 'Something went wrong.')
    } finally {
      setPlacingOrder(false)
    }
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  )

  function clearForm() {
    setEditId(null)
    setProductName('')
    setBrand('')
    setPrice('')
    setSize('')
    setColor('')
    setStockQuantity('')
    setDescription('')
    setImageUrl('')
    setCategoryId('1')
  }

  function editProduct(product) {
    setEditId(product.productId)
    setProductName(product.productName || '')
    setBrand(product.brand || '')
    setPrice(String(product.price ?? ''))
    setSize(String(product.size ?? ''))
    setColor(product.color || '')
    setStockQuantity(String(product.stockQuantity ?? ''))
    setDescription(product.description || '')
    setImageUrl(product.imageUrl || '')
    setCategoryId(String(product.categoryId ?? 1))

    document.getElementById('product-form')?.scrollIntoView({
      behavior: 'smooth'
    })
  }

  function saveProduct(event) {
    event.preventDefault()

    const product = {
      productName,
      brand,
      price: Number(price),
      size: Number(size),
      color,
      stockQuantity: Number(stockQuantity),
      description,
      imageUrl,
      categoryId: Number(categoryId)
    }

    const url =
      editId !== null ? `${API_URL}/${editId}` : API_URL

    const method = editId !== null ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(product)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Could not save product: ${response.status}`)
        }

        return response.text()
      })
      .then(() => {
        alert(
          editId !== null
            ? 'Shoe updated successfully!'
            : 'Shoe added successfully!'
        )

        clearForm()
        getProducts()
      })
      .catch(error => {
        console.error(error)
        alert(error.message || 'Could not save shoe.')
      })
  }

  function deleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this shoe?')) {
      return
    }

    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not delete shoe')
        }

        if (editId === id) {
          clearForm()
        }

        setCart(currentCart =>
          currentCart.filter(item => item.productId !== id)
        )

        alert('Shoe deleted successfully!')
        getProducts()
      })
      .catch(error => {
        console.error(error)
        alert('Could not delete shoe. Please check the backend.')
      })
  }

  function registerUser(event) {
    event.preventDefault()

    const newUser = {
      fullName,
      email,
      phone,
      password
    }

    fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    })
      .then(async response => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed')
        }

        return data
      })
      .then(data => {
        alert(data.message || 'Registration successful!')
        setFullName('')
        setEmail('')
        setPhone('')
        setPassword('')
        setShowRegister(false)
      })
      .catch(error => {
        console.error(error)
        alert(error.message || 'Could not register. Please try again.')
      })
  }

  function loginUser(event) {
    event.preventDefault()

    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    })
      .then(async response => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Login failed')
        }

        return data
      })
      .then(data => {
        console.log('Login response:', data)

        const basicAuth =
          'Basic ' + btoa(`${loginEmail}:${loginPassword}`)

        setAuthHeader(basicAuth)
        setLoggedInUser(data)
        loadCart(data.userId, basicAuth)

        setLoginEmail('')
        setLoginPassword('')
        setShowLogin(false)
        setShowRegister(false)
        setShowCart(false)
        setShowOrders(false)

        alert(`Welcome, ${data.fullName}!`)
      })
      .catch(error => {
        console.error(error)
        alert(error.message || 'Could not log in. Please try again.')
      })
  }

  function logoutUser() {
    setLoggedInUser(null)
    setAuthHeader('')
    setCart([])
    setOrders([])
    setShowLogin(false)
    setShowRegister(false)
    setShowCart(false)
    setShowOrders(false)
    alert('You have logged out.')
  }

  const filteredProducts = products.filter(product => {
    const name = (product.productName || '').toLowerCase()
    const productBrand = (product.brand || '').toLowerCase()
    const search = searchText.toLowerCase()

    const matchesSearch =
      name.includes(search) || productBrand.includes(search)

    const matchesCategory =
      selectedCategory === 'All' ||
      String(product.categoryId) === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="store">
      <div className="announcement">
        FIND YOUR NEXT FAVORITE PAIR
      </div>

      <nav className="navbar">
        <a
          className="logo"
          href="#home"
          onClick={() => {
            setShowLogin(false)
            setShowRegister(false)
            setShowCart(false)
            setShowOrders(false)
          }}
        >
          SOLE<span>ZONE</span>
          <small>STEP INTO STYLE</small>
        </a>

        <div className="nav-links">
          <a
            href="#home"
            onClick={() => {
              setShowLogin(false)
              setShowRegister(false)
              setShowCart(false)
              setShowOrders(false)
            }}
          >
            Home
          </a>

          <a
            href="#shoes"
            onClick={() => {
              setShowLogin(false)
              setShowRegister(false)
              setShowCart(false)
              setShowOrders(false)
            }}
          >
            Shop Shoes
          </a>

          {loggedInUser && (
            <a
              href="#my-orders"
              onClick={() => {
                setShowLogin(false)
                setShowRegister(false)
                setShowCart(false)
                setShowOrders(true)
                loadOrders(loggedInUser.userId)
              }}
            >
              My Orders
            </a>
          )}

          {loggedInUser?.role?.includes('ADMIN') && (
            <a
              href="#product-form"
              onClick={() => {
                setShowLogin(false)
                setShowRegister(false)
                setShowCart(false)
                setShowOrders(false)
                setTimeout(() => {
                  document.getElementById('product-form')?.scrollIntoView({
                    behavior: 'smooth'
                  })
                }, 0)
              }}
            >
              Manage Products
            </a>
          )}
        </div>

        {loggedInUser ? (
          <button
            type="button"
            className="nav-shop"
            onClick={logoutUser}
          >
            LOG OUT
          </button>
        ) : (
          <>
            <button
              type="button"
              className="nav-shop"
              onClick={() => {
                setShowLogin(!showLogin)
                setShowRegister(false)
                setShowCart(false)
                setShowOrders(false)
              }}
            >
              {showLogin ? 'BACK TO SHOP' : 'LOGIN'}
            </button>

            <button
              type="button"
              className="nav-shop"
              onClick={() => {
                setShowRegister(!showRegister)
                setShowLogin(false)
                setShowCart(false)
                setShowOrders(false)
              }}
            >
              {showRegister ? 'BACK TO SHOP' : 'CREATE ACCOUNT'}
            </button>
          </>
        )}

        <button
          type="button"
          className="nav-shop"
          onClick={() => {
            setShowCart(!showCart)
            setShowLogin(false)
            setShowRegister(false)
            setShowOrders(false)
          }}
        >
          {showCart ? 'CONTINUE SHOPPING' : `CART (${cartCount})`}
        </button>
      </nav>

      {loggedInUser && (
        <p className="eyebrow" style={{ textAlign: 'center', padding: '10px' }}>
          SIGNED IN AS {loggedInUser.fullName} ({loggedInUser.role})
        </p>
      )}

      <main>
        {showLogin ? (
          <section className="manage-section">
            <div className="manage-intro">
              <p className="eyebrow">WELCOME BACK</p>
              <h2>LOG INTO<br /><span>SOLEZONE.</span></h2>
              <p>Sign in to your customer account.</p>
            </div>

            <form className="product-form" onSubmit={loginUser}>
              <div className="form-heading">
                <h3>Customer Login</h3>
                <span>ENTER YOUR DETAILS</span>
              </div>

              <label>
                Email
                <input
                  type="email"
                  value={loginEmail}
                  onChange={event => setLoginEmail(event.target.value)}
                  maxLength="150"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={event => setLoginPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              <button className="save-button" type="submit">
                LOGIN ↗
              </button>

              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="nav-shop"
                  onClick={() => {
                    setShowLogin(false)
                    setShowRegister(true)
                  }}
                >
                  CREATE ACCOUNT
                </button>
              </p>
            </form>
          </section>
        ) : showRegister ? (
          <section className="manage-section">
            <div className="manage-intro">
              <p className="eyebrow">JOIN SOLEZONE</p>
              <h2>CREATE YOUR<br /><span>ACCOUNT.</span></h2>
              <p>Create an account to get started with SoleZone.</p>
            </div>

            <form className="product-form" onSubmit={registerUser}>
              <div className="form-heading">
                <h3>Customer Registration</h3>
                <span>ALL FIELDS REQUIRED</span>
              </div>

              <label>
                Full Name
                <input
                  type="text"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  maxLength="100"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  maxLength="150"
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  value={phone}
                  onChange={event => setPhone(event.target.value)}
                  maxLength="20"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  minLength="8"
                  required
                />
              </label>

              <button className="save-button" type="submit">
                CREATE ACCOUNT ↗
              </button>
            </form>
          </section>
        ) : showOrders ? (
          <section className="collection" id="my-orders">
            <div className="section-heading">
              <p className="eyebrow">YOUR PURCHASES</p>
              <h2>My Orders</h2>
              <p>Check your previous orders and their status.</p>
            </div>

            {orders.length === 0 ? (
              <div className="empty-cart">
                <h3>No orders yet</h3>
                <p>Your orders will appear here after checkout.</p>
              </div>
            ) : (
              <div className="product-grid">
                {orders.map((order) => (
                  <article className="order-card" key={order.orderId}>
                    <div className="order-card-header">
                      <div>
                        <p className="order-label">ORDER NUMBER</p>
                        <h3>#{order.orderId}</h3>
                      </div>

                      <span className="order-status">
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="order-card-body">
                      <div>
                        <p className="order-label">ORDER DATE</p>
                        <p>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="order-label">TOTAL AMOUNT</p>
                        <h3>₹{order.totalAmount}</h3>
                      </div>
                    </div>

                    <div className="order-address">
                      <p className="order-label">DELIVERY ADDRESS</p>
                      <p>{order.shippingAddress}</p>
                    </div>

                    <button
                      type="button"
                      className="delete-order-button"
                      onClick={() => deleteOrder(order.orderId)}
                    >
                      Delete Order
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : showCart ? (
          <section className="collection" id="shopping-cart">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR SELECTION</p>
                <h2>YOUR CART<span>.</span></h2>
              </div>

              <p className="collection-description">
                Review your shoes before checkout.
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">
                <h3>YOUR CART IS EMPTY.</h3>
                <p>Add some shoes to get started.</p>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                >
                  EXPLORE SHOES
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <article
                      className="product"
                      key={item.productId}
                    >
                      <div className="product-image">
                        <img
                          src={
                            item.imageUrl ||
                            'https://placehold.co/600x500?text=SoleZone'
                          }
                          alt={item.productName}
                          onError={event => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src =
                              'https://placehold.co/600x500?text=Image+Unavailable'
                          }}
                        />
                      </div>

                      <div className="product-info">
                        <div className="product-brand">
                          {item.brand}
                        </div>

                        <h3>{item.productName}</h3>

                        <div className="product-bottom">
                          <span className="product-price">
                            ₹{Number(item.price).toLocaleString('en-IN')}
                          </span>
                          <span className="product-size">
                            SIZE {item.size}
                          </span>
                        </div>

                        <p>Quantity: {item.quantity}</p>

                        <p>
                          Subtotal: ₹
                          {(Number(item.price) * item.quantity)
                            .toLocaleString('en-IN')}
                        </p>

                        <div className="product-actions">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              decreaseQuantity(item.productId)
                            }
                          >
                            −
                          </button>

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              increaseQuantity(item.productId)
                            }
                          >
                            +
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              removeFromCart(item.productId)
                            }
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="cart-summary">
                  <h3>
                    TOTAL: ₹{cartTotal.toLocaleString('en-IN')}
                  </h3>
                  <p>{cartCount} item(s) in your cart</p>
                  
                  <div className="checkout-form">
                    <h3>Shipping Address</h3>

                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your full shipping address"
                      rows="3"
                    />

                    <button
                      type="button"
                      className="save-button"
                      onClick={placeOrder}
                      disabled={placingOrder || cart.length === 0}
                    >
                      {placingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>

                    {orderMessage && <p>{orderMessage}</p>}
                  </div>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowCart(false)}
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </>
            )}
          </section>
        ) : (
          <>
            <section className="hero" id="home">
              <div className="hero-copy">
                <p className="eyebrow">THE EVERYDAY ICONS</p>

                <h1>
                  MADE TO
                  <br />
                  <span>MOVE.</span>
                </h1>

                <p className="hero-description">
                  The right pair changes everything.
                  Discover sneakers made for your everyday journey.
                </p>

                <a className="primary-button" href="#shoes">
                  SHOP THE COLLECTION <span>→</span>
                </a>

                <div className="hero-note">
                  <span className="note-line"></span>
                  YOUR STYLE. YOUR STRIDE.
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-circle"></div>
                <div className="hero-label">
                  SOLEZONE / COLLECTION 01
                </div>
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85"
                  alt="Red sneaker from the SoleZone collection"
                />
                <div className="hero-stamp">
                  <span>WALK</span>
                  <span>YOUR</span>
                  <span>WAY.</span>
                </div>
              </div>
            </section>

            <section className="benefits">
              <div><span>01</span> EVERYDAY COMFORT</div>
              <div><span>02</span> STREET-READY STYLE</div>
              <div><span>03</span> FIND YOUR PERFECT FIT</div>
            </section>

            <section className="collection" id="shoes">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">CURATED FOR YOU</p>
                  <h2>THE COLLECTION<span>.</span></h2>
                </div>

                <p className="collection-description">
                  Find the pair that speaks your style.
                  Every step starts here.
                </p>
              </div>

              <div className="shop-controls">
                <input
                  type="text"
                  placeholder="Search by shoe name or brand..."
                  value={searchText}
                  onChange={event => setSearchText(event.target.value)}
                  aria-label="Search shoes"
                />

                <select
                  value={selectedCategory}
                  onChange={event =>
                    setSelectedCategory(event.target.value)
                  }
                  aria-label="Filter by category"
                >
                  <option value="All">All Categories</option>
                  <option value="1">Sneakers</option>
                  <option value="2">Running Shoes</option>
                  <option value="3">Sports Shoes</option>
                  <option value="4">Formal Shoes</option>
                </select>
              </div>

              <div className="results-line">
                <span>OUR PICKS</span>
                <span>{filteredProducts.length} PRODUCTS</span>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>Loading shoes...</p>
              ) : filteredProducts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>No shoes found matching your search.</p>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map(product => (
                    <article className="product" key={product.productId}>
                      <div className="product-image">
                        <img
                          src={product.imageUrl || 'https://placehold.co/600x500?text=SoleZone'}
                          alt={product.productName}
                          onError={e => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = 'https://placehold.co/600x500?text=Image+Unavailable'
                          }}
                        />
                      </div>
                      <div className="product-info">
                        <div className="product-brand">{product.brand}</div>
                        <h3>{product.productName}</h3>
                        <div className="product-bottom">
                          <span className="product-price">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                          <span className="product-size">SIZE {product.size}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0' }}>
                          Stock: {product.stockQuantity} available
                        </p>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="save-button"
                            onClick={() => addToCart(product)}
                            style={{ flex: 1, padding: '8px' }}
                          >
                            ADD TO CART
                          </button>
                          {loggedInUser?.role?.includes('ADMIN') && (
                            <>
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() => editProduct(product)}
                              >
                                EDIT
                              </button>
                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => deleteProduct(product.productId)}
                              >
                                DELETE
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {loggedInUser?.role?.includes('ADMIN') && (
              <section className="manage-section" id="product-form">
                <div className="manage-intro">
                  <p className="eyebrow">ADMIN PANEL</p>
                  <h2>{editId !== null ? 'EDIT SHOE' : 'ADD NEW SHOE'}</h2>
                  <p>Manage inventory items for SoleZone.</p>
                </div>

                <form className="product-form" onSubmit={saveProduct}>
                  <div className="form-heading">
                    <h3>Product Details</h3>
                    <span>{editId !== null ? 'UPDATE ITEM' : 'NEW ITEM'}</span>
                  </div>

                  <label>
                    Product Name
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Brand
                    <input
                      type="text"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Price (₹)
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Size
                    <input
                      type="number"
                      value={size}
                      onChange={e => setSize(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Color
                    <input
                      type="text"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                    />
                  </label>

                  <label>
                    Stock Quantity
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={e => setStockQuantity(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Category ID
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                    >
                      <option value="1">1 - Sneakers</option>
                      <option value="2">2 - Running Shoes</option>
                      <option value="3">3 - Sports Shoes</option>
                      <option value="4">4 - Formal Shoes</option>
                    </select>
                  </label>

                  <label>
                    Image URL
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </label>

                  <label style={{ gridColumn: '1 / -1' }}>
                    Description
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows="3"
                    />
                  </label>

                  <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
                    <button className="save-button" type="submit" style={{ flex: 1 }}>
                      {editId !== null ? 'UPDATE SHOE ↗' : 'SAVE SHOE ↗'}
                    </button>
                    {editId !== null && (
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={clearForm}
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App