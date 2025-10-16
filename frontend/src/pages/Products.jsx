import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext.jsx";
import { useFavorites } from "../context/FavoritesContext";
import { useUser } from "../context/UserContext";
import SkeletonLoader from "../components/SkeletonLoader";
import api from "../utils/api"; // Import the api instance

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("latest");
  const [brand, setBrand] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [addedToCartId, setAddedToCartId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { addToCart } = useContext(CartContext);
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites() || {};
  const { user } = useUser();

  // Fetch products from backend using Axios
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make API request using Axios
        const response = await axios.get("http://localhost:3000/watches/get-all-products");
        
        // Check if response is successful
        if (response.data.status === "Success") {
          // Transform backend data to match frontend needs
          const productsData = response.data.data.map(product => ({
            id: product._id,         // MongoDB _id becomes our id
            name: product.name,
            price: product.price,
            image: product.url,      // Backend uses 'url' for image
            brand: product.brand,
            category: product.category
          }));
          
          // Update state with transformed data
          setAllProducts(productsData);
        } else {
          // Handle API error response
          setError(response.data.message || "Failed to fetch products");
        }
      } catch (err) {
        // Handle network or server errors
        console.error("Error fetching products:", err);
        setError("An error occurred while fetching products");
      } finally {
        // Always hide loading state
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchProducts();
  }, []); // Empty dependency array means this runs only once

  // Filter and sort products when dependencies change
  useEffect(() => {
    let filteredProducts = [...allProducts];
    
    // Apply brand filter
    if (brand !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.brand.toLowerCase() === brand.toLowerCase()
      );
    }
    
    // Apply price filter
    if (priceRange !== "all") {
      if (priceRange === "under500") {
        filteredProducts = filteredProducts.filter((p) => p.price < 500);
      } else if (priceRange === "500to2000") {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= 500 && p.price <= 2000
        );
      } else if (priceRange === "above2000") {
        filteredProducts = filteredProducts.filter((p) => p.price > 2000);
      }
    }

    // Sort products
    if (sort === "priceLow") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === "priceHigh") {
      filteredProducts.sort((a, b) => b.price - a.price);
    }
    // For "latest", we don't need to sort as backend returns newest first

    setDisplayedProducts(filteredProducts);
  }, [allProducts, sort, brand, priceRange]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Updated handleAddToCart function to communicate with backend
  const handleAddToCart = async (product) => {
    if (!user) {
      showNotification('Please log in to add items to your cart', 'auth');
      return;
    }
    
    try {
      // First, add to the backend cart
      const response = await api.put('/cart/add-to-cart', {}, {
        headers: { watchid: product.id.toString() }
      });
      
      if (response.data.status === "success") {
        // Then update the frontend cart state
        addToCart({ ...product, quantity: 1 });
        setAddedToCartId(product.id);
        showNotification('Added to cart!', 'success');
        
        setTimeout(() => setAddedToCartId(null), 2000);
      } else {
        // Handle backend error response
        showNotification(response.data.message || 'Failed to add item to cart', 'error');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showNotification('Error adding item to cart', 'error');
    }
  };

  const toggleFavorite = async (product) => {
    if (!user) {
      showNotification('Please log in to add items to your favorites', 'auth');
      return;
    }
    
    try {
      if (isInFavorites(product.id)) {
        const success = await removeFromFavorites(product.id);
        if (success) {
          showNotification('Removed from favorites', 'favorite');
        } else {
          showNotification('Failed to remove from favorites', 'error');
        }
      } else {
        const success = await addToFavorites(product.id);
        if (success) {
          showNotification('Added to favorites', 'favorite');
        } else {
          showNotification('Failed to add to favorites', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showNotification('Error updating favorites', 'error');
    }
  };

  return (
    <section className="relative py-20 min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-95"></div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className={`relative rounded-xl shadow-xl overflow-hidden ${
            notification.type === 'auth' 
              ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' 
              : notification.type === 'error'
                ? 'bg-gradient-to-r from-red-600 to-red-500'
                : notification.type === 'favorite'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500'
                  : notification.type === 'success'
                    ? 'bg-gradient-to-r from-green-600 to-green-500'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500'
          }`}>
            <div className="absolute inset-0 bg-white opacity-10"></div>
            <div className="relative p-4 flex items-center">
              <div className="flex-shrink-0 p-2 rounded-lg bg-black bg-opacity-20 mr-3">
                {notification.type === 'auth' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : notification.type === 'error' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : notification.type === 'success' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill={notification.type === 'favorite' ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{notification.message}</p>
                {notification.type === 'auth' && (
                  <div className="mt-1">
                    <Link 
                      to="/login" 
                      className="text-blue-200 hover:text-blue-100 underline text-sm"
                    >
                      Log in now
                    </Link>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setNotification({ show: false, message: '', type: '' })}
                className="ml-4 p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          All Products
        </h2>

        {/* Filters + Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          {/* Filters */}
          <div className="flex gap-4">
            {loading ? (
              <SkeletonLoader type="button" count={2} />
            ) : (
              <>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Brands</option>
                  <option value="rolex">Rolex</option>
                  <option value="omega">Omega</option>
                  <option value="tag heuer">Tag Heuer</option>
                  <option value="patek philippe">Patek Philippe</option>
                </select>

                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Prices</option>
                  <option value="under500">Under $500</option>
                  <option value="500to2000">$500 – $2000</option>
                  <option value="above2000">Above $2000</option>
                </select>
              </>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center">
            <label className="mr-2 font-semibold">Sort by:</label>
            {loading ? (
              <SkeletonLoader type="button" />
            ) : (
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="latest">Latest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="text-center mt-10 py-10">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-xl text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:scale-105 transition duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? (
              <SkeletonLoader type="product" count={8} />
            ) : (
              displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-all duration-300 group border border-gray-700"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x200?text=Watch+Image";
                      }}
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product)}
                      disabled={!user}
                      className={`absolute top-3 right-3 p-2 rounded-full ${
                        !user 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                          : isInFavorites && isInFavorites(product.id)
                            ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white'
                            : 'bg-gray-900 bg-opacity-70 text-gray-300 hover:text-pink-400'
                      } transition-all duration-300`}
                    >
                      <svg 
                        className={`w-5 h-5 ${isInFavorites && isInFavorites(product.id) ? 'fill-current' : ''}`} 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-blue-400 mb-4">${product.price}</p>

                    {/* Actions */}
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!user}
                        className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-all duration-300 ${
                          !user 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : addedToCartId === product.id
                              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {addedToCartId === product.id ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Added!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>
                      <Link
                        to={`/product/${product.id}`}
                        className="px-4 py-2 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition duration-300 hover:scale-105"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* No Products */}
        {!loading && !error && displayedProducts.length === 0 && (
          <div className="text-center mt-10 py-10">
            <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-xl text-gray-400">No products match your filters.</p>
            <button 
              onClick={() => {
                setBrand("all");
                setPriceRange("all");
                setSort("latest");
              }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:scale-105 transition duration-300"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Login Prompt for Non-logged Users */}
        {!loading && !error && !user && displayedProducts.length > 0 && (
          <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl text-center">
            <p className="text-yellow-300">
              Please <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">log in</Link> to add items to cart or favorites.
            </p>
          </div>
        )}
      </div>
      
      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}