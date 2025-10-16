
//with ackend fetch and user authentication handling check kri leje user profile atade pachi 

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";
import axios from "axios";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, setCartItems } = useContext(CartContext);
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart data from backend when component mounts
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (user) {
          // If user is logged in, fetch cart from backend
          const response = await axios.get(`http://localhost:3000/watches/get-cart/${user.id}`);
          
          if (response.data.status === "Success") {
            // Transform backend cart items to match frontend structure
            const transformedCartItems = response.data.data.map(item => ({
              id: item.productId._id,
              name: item.productId.name,
              price: item.productId.price,
              image: item.productId.url, // Backend uses 'url' for image
              brand: item.productId.brand,
              category: item.productId.category,
              quantity: item.quantity
            }));
            
            // Update cart context with fetched data
            setCartItems(transformedCartItems);
          } else {
            setError(response.data.message || "Failed to fetch cart");
          }
        } else {
          // If user is not logged in, just use local cart (from context)
          // No need to fetch from backend
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("An error occurred while fetching your cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, setCartItems]);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calculate total number of items in cart
  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const handleCheckout = () => {
    if (user) {
      // User is logged in, proceed to checkout
      navigate("/checkout");
    } else {
      // User is not logged in, redirect to login page
      navigate("/login", { state: { from: "/cart" } });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white inset-0 bg-gradient-to-r from-black via-gray-900 to-black animate-gradient-x opacity-90">
        <h2 className="text-4xl font-bold mb-4 text-red-500">
          Error Loading Cart
        </h2>
        <p className="mb-6 text-lg text-gray-200">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-black font-bold rounded-lg 
               shadow-[0_0_15px_rgba(255,255,255,0.8)]
               hover:shadow-[0_0_25px_rgba(255,255,255,1),0_0_50px_rgba(255,255,255,0.8)]
               hover:scale-105 
               transition duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white inset-0 bg-gradient-to-r from-black via-gray-900 to-black animate-gradient-x opacity-90">
        <h2 className="text-4xl font-bold mb-4 animate-pulse">
          Oops! Your cart is empty 😔
        </h2>
        <p className="mb-6 text-lg text-gray-200">
          Looks like you haven't added any watches yet. Let's fix that!
        </p>
        <Link to="/products" className="px-4 py-2 bg-white text-black font-bold rounded-lg 
             shadow-[0_0_15px_rgba(255,255,255,0.8)]
             hover:shadow-[0_0_25px_rgba(255,255,255,1),0_0_50px_rgba(255,255,255,0.8)]
             hover:scale-105 
             transition duration-300">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <section className="relative py-20 min-h-screen text-white bg-gradient-to-r from-black via-gray-800 to-black">
      {/* Cart Header with Badge */}
      <div className="max-w-6xl mx-auto px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-4xl font-extrabold">Your Cart</h1>
          {totalItems > 0 && (
            <span className="ml-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
              {totalItems}
            </span>
          )}
        </div>
        <Link to="/products" className="text-blue-400 hover:text-blue-300 transition flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Continue Shopping
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <SkeletonLoader type="product" count={3} />
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-center gap-6 bg-gray-900 p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300 border border-gray-700 relative overflow-hidden"
              >
                {/* Adaptive Glow Background */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 opacity-20 blur-xl animate-pulse-slow pointer-events-none"></div>

                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-contain rounded-xl relative z-10 bg-gray-800 p-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x200?text=Watch+Image";
                  }}
                />

                {/* Product Info */}
                <div className="flex-1 flex flex-col gap-2 relative z-10">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-300">${item.price.toFixed(2)}</p>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-medium">Qty:</span>
                    <button
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition relative z-10"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total & Checkout */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {loading ? (
            <SkeletonLoader type="text" count={1} />
          ) : (
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">
                Total: ${totalPrice.toFixed(2)}
              </h2>
              <span className="ml-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            </div>
          )}
          {loading ? (
            <SkeletonLoader type="button" />
          ) : (
            <button
              onClick={handleCheckout}
              className="relative inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-blue-400 transition overflow-hidden group"
            >
              {/* Glow Background */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 opacity-50 blur-xl filter animate-pulse-slow"></span>
              {/* Button Text */}
              <span className="relative z-10 flex items-center">
                {user ? "Proceed to Checkout" : "Login to Checkout"}
                {!user && (
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Login Prompt for Non-logged Users */}
        {!loading && !user && cartItems.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl text-center">
            <p className="text-yellow-300">
              Please <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">log in</Link> to proceed with checkout.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}




    