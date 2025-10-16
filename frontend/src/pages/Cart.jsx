// src/pages/Cart.jsx
import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, fetchCartItems } = useContext(CartContext);
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [removingItems, setRemovingItems] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const isInitialMount = useRef(true);
  const prevCartItemsLength = useRef(0);

  // Memoize the fetch function to prevent unnecessary re-renders
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchCartItems();
    } catch (err) {
      setError('Failed to fetch cart items. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  }, [fetchCartItems]);

  useEffect(() => {
    // Only run on initial mount
    if (isInitialMount.current) {
      loadCart();
      isInitialMount.current = false;
    }
  }, [loadCart]);

  // Check if cart is empty - use a stable approach to avoid rapid toggling
  useEffect(() => {
    if (!loading) {
      // Only update if the cart length has actually changed
      if (prevCartItemsLength.current !== cartItems.length) {
        setIsCartEmpty(cartItems.length === 0);
        prevCartItemsLength.current = cartItems.length;
      }
    }
  }, [cartItems, loading]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleRemoveItem = useCallback(async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDialog(id);
  }, []);

  const confirmRemoveItem = useCallback(async () => {
    const itemId = showConfirmDialog;
    setRemovingItems(prev => ({...prev, [itemId]: true}));
    try {
      const success = await removeFromCart(itemId);
      if (!success) {
        setError('Failed to remove item from cart. Please try again.');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError(`An error occurred: ${err.message || 'Failed to remove item'}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setRemovingItems(prev => ({...prev, [itemId]: false}));
      setShowConfirmDialog(null);
    }
  }, [showConfirmDialog, removeFromCart]);

  const cancelRemoveItem = useCallback(() => {
    setShowConfirmDialog(null);
  }, []);

  const handleUpdateQuantity = useCallback(async (id, newQuantity, e) => {
    e.preventDefault();
    e.stopPropagation();
    setUpdatingItems(prev => ({...prev, [id]: true}));
    try {
      await updateQuantity(id, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdatingItems(prev => ({...prev, [id]: false}));
    }
  }, [updateQuantity]);

  const handleCheckout = useCallback((e) => {
    e.preventDefault();
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: "/cart" } });
    }
  }, [user, navigate]);

  // Calculate totals
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <section className="relative py-20 min-h-screen text-white bg-gradient-to-r from-black via-gray-800 to-black">
      {/* Error Message with Retry */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn flex items-center">
          <span>{error}</span>
          <button 
            onClick={loadCart}
            className="ml-4 underline"
            aria-label="Retry fetching cart items"
          >
            Retry
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl mb-4">Confirm Removal</h3>
            <p>Are you sure you want to remove this item from your cart?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button 
                onClick={cancelRemoveItem}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                aria-label="Cancel item removal"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveItem}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition flex items-center"
                disabled={removingItems[showConfirmDialog]}
                aria-label="Confirm item removal"
              >
                {removingItems[showConfirmDialog] ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Removing...
                  </>
                ) : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* Use a single container with consistent structure */}
        <div className="transition-opacity duration-300">
          {/* Empty Cart State - Rendered in the same DOM structure */}
          {isCartEmpty && !loading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
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
          ) : (
            <>
              {/* Cart Items */}
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
                        src={item.image || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="w-32 h-32 object-contain rounded-xl relative z-10 bg-gray-800 p-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
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
                            type="button"
                            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition disabled:opacity-50 flex items-center justify-center w-8 h-8"
                            onClick={(e) => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1), e)}
                            disabled={item.quantity <= 1 || updatingItems[item.id]}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            {updatingItems[item.id] ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : '-'}
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition flex items-center justify-center w-8 h-8"
                            onClick={(e) => handleUpdateQuantity(item.id, item.quantity + 1, e)}
                            disabled={updatingItems[item.id]}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            {updatingItems[item.id] ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : '+'}
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveItem(item.id, e)}
                        className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition relative z-10 flex items-center"
                        disabled={removingItems[item.id]}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        {removingItems[item.id] ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Removing...
                          </>
                        ) : 'Remove'}
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
                    type="button"
                    onClick={handleCheckout}
                    className="relative inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-blue-400 transition overflow-hidden group"
                    aria-label={user ? "Proceed to checkout" : "Login to checkout"}
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}