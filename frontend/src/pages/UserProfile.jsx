// src/pages/EnhancedProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";
import { useFavorites } from '../context/FavoritesContext';
import { useUser } from '../context/UserContext';

const EnhancedProfile = () => {
  const { user, loading: userLoading, fetchUserInfo } = useUser();
  const { favorites, removeFromFavorites, loading: favoritesLoading } = useFavorites() || { favorites: [], loading: true };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        await fetchUserInfo();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, [fetchUserInfo]);

  const handleLogout = () => {
    logout();
    navigate('/');
    window.scrollTo(0, 0);
  };

  // Show login prompt if user is not logged in and not loading
  if (!user && !loading && !userLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-400 drop-shadow-lg mb-8">Profile</h1>
          <div className="py-12">
            <p className="text-4xl font-bold mb-4 animate-pulse">You need to be logged in to view your 📲 profile.</p>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-white text-black font-bold rounded-lg 
             shadow-[0_0_15px_rgba(255,255,255,0.8)]
             hover:shadow-[0_0_25px_rgba(255,255,255,1),0_0_50px_rgba(255,255,255,0.8)]
             hover:scale-105 
             transition duration-300"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if user is not available yet
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
            <SkeletonLoader type="text" count={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 text-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              {/* Profile Summary */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <img 
                    src={user.avatar || "https://static.vecteezy.com/system/resources/previews/024/183/502/non_2x/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg"} 
                    alt={user.username || user.name} 
                    className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <h2 className="text-xl font-bold">{user.username || user.name}</h2>
                <p className="text-blue-300 text-sm">{user.email}</p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-700 rounded-xl p-3 text-center">
                  {/* FIXED: Use the length of the orders array instead of the orders themselves */}
                  <p className="text-xl font-bold text-blue-400">{user.orders ? user.orders.length : 0}</p>
                  <p className="text-xs text-gray-400">Orders</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-pink-400">{favorites.length}</p>
                  <p className="text-xs text-gray-400">Favorites</p>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center ${activeTab === 'dashboard' ? 'bg-blue-900 text-blue-300' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center ${activeTab === 'profile' ? 'bg-blue-900 text-blue-300' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Info
                </button>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center ${activeTab === 'favorites' ? 'bg-blue-900 text-blue-300' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('favorites')}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites
                </button>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center ${activeTab === 'orders' ? 'bg-blue-900 text-blue-300' : 'hover:bg-gray-700'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Orders
                </button>
              </nav>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="w-full mt-8 px-4 py-3 bg-red-900 hover:bg-red-800 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-pulse"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-4">
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                
                {/* Mini Favorites Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold">Recent Favorites</h3>
                    <button 
                      onClick={() => setActiveTab('favorites')}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View All
                    </button>
                  </div>
                  {loading || userLoading || favoritesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <SkeletonLoader type="product" count={3} />
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {favorites.slice(0, 3).map((product) => (
                        <div key={product._id} className="bg-gray-700 rounded-lg p-3 flex items-center">
                          <img 
                            src={product.url || "https://via.placeholder.com/150"} 
                            alt={product.name} 
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.brand}</p>
                          </div>
                          <span className="font-bold text-blue-400 text-sm">${product.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-3 text-sm">No favorites yet</p>
                  )}
                </div>
                
                {/* Mini Orders Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold">Recent Orders</h3>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View All
                    </button>
                  </div>
                  {loading || userLoading ? (
                    <SkeletonLoader type="text" count={2} />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Order #12345</p>
                          <p className="text-xs text-gray-400">Today</p>
                        </div>
                        <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">Delivered</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Order #12344</p>
                          <p className="text-xs text-gray-400">Yesterday</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded text-xs">Processing</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-4">
                <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                
                {loading || userLoading ? (
                  <div className="space-y-3">
                    <SkeletonLoader type="text" count={2} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 mb-1 text-sm">Full Name</label>
                        <div className="p-2 bg-gray-700 rounded-lg text-sm">{user.username || user.name}</div>
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1 text-sm">Email Address</label>
                        <div className="p-2 bg-gray-700 rounded-lg text-sm">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-700">
                      <h3 className="text-md font-medium mb-3">Account Security</h3>
                      <div className="space-y-2">
                        <button className="w-full p-2 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition flex items-center justify-between text-sm">
                          <span>Change Password</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Your Favorites</h2>
                  <span className="text-gray-400">{favorites.length} items</span>
                </div>
                
                {loading || userLoading || favoritesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SkeletonLoader type="product" count={3} />
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No favorites yet</h3>
                    <p className="text-gray-400 mb-4 text-sm">You haven't added any items to your favorites.</p>
                    <button 
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-lg shadow hover:scale-105 transition-all duration-300 text-sm"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((product) => (
                      <div key={product._id} className="bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
                        <div className="relative">
                          <img 
                            src={product.url || "https://via.placeholder.com/150"} 
                            alt={product.name} 
                            className="w-full h-36 object-cover"
                          />
                          <button 
                            onClick={() => removeFromFavorites(product._id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                            aria-label="Remove from favorites"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-white mb-1 text-sm">{product.name}</h4>
                          <p className="text-gray-400 text-xs mb-2">{product.brand}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg text-blue-400">${product.price.toLocaleString()}</span>
                            <button 
                              onClick={() => navigate(`/product/${product._id}`)}
                              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-4">
                <h2 className="text-2xl font-bold mb-4">Order History</h2>
                
                {loading || userLoading ? (
                  <div className="space-y-3">
                    <SkeletonLoader type="product" count={3} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-sm">Order #12345</h4>
                          <p className="text-xs text-gray-400">Placed on {new Date().toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Delivered</span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-gray-400 text-xs">2 items</span>
                        <span className="font-medium text-sm">$1,250.00</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-sm">Order #12344</h4>
                          <p className="text-xs text-gray-400">Placed on {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">Processing</span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-gray-400 text-xs">1 item</span>
                        <span className="font-medium text-sm">$850.00</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-sm">Order #12343</h4>
                          <p className="text-xs text-gray-400">Placed on {new Date(Date.now() - 259200000).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Delivered</span>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-gray-400 text-xs">3 items</span>
                        <span className="font-medium text-sm">$2,100.00</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfile;