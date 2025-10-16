// src/pages/Checkout.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import api from "../utils/api";

// Mock payment function - simulates payment processing
const processPayment = async () => {
  // Simulate API call delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful payment 90% of the time
      if (Math.random() > 0.1) {
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}_${Math.floor(Math.random() * 1000000)}`
        });
      } else {
        reject(new Error("Payment failed. Please try again."));
      }
    }, 1500);
  });
};

export default function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Calculate total price directly from cart items
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [activeStep, setActiveStep] = useState(0); // 0: Shipping, 1: Payment, 2: Review

  const steps = ["Shipping", "Payment", "Review"];

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError("");
    
    try {
      // Process payment using mock function
      const paymentResult = await processPayment();
      
      if (paymentResult.success) {
        // Create order in backend
        const response = await api.post('/orders/place-order', {
          shippingAddress: shippingInfo,
          paymentMethod: "Credit Card",
          paymentIntentId: paymentResult.transactionId
        });

        const orderData = response.data;

        if (orderData.status === 'success') {
          setIsProcessing(false);
          setOrderComplete(true);
          clearCart();
          
          // Redirect to confirmation page after 2 seconds
          setTimeout(() => {
            navigate("/order-confirmation");
          }, 2000);
        } else {
          setPaymentError(orderData.message);
          setIsProcessing(false);
        }
      }
    } catch (error) {
      setPaymentError(error.message);
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
          <p className="mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
          <p className="mb-6">Redirecting to confirmation page...</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 text-white bg-gradient-to-r from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold mb-8">Checkout</h1>
        
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === activeStep ? 'bg-blue-600' : index < activeStep ? 'bg-green-600' : 'bg-gray-700'}`}>
                  {index < activeStep ? '✓' : index + 1}
                </div>
                <span className={`mt-2 ${index === activeStep ? 'text-blue-400' : index < activeStep ? 'text-green-400' : 'text-gray-500'}`}>{step}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 opacity-10 blur-xl animate-pulse-slow pointer-events-none"></div>
            
            <h2 className="text-2xl font-bold mb-6 relative z-10">Order Summary</h2>
            
            <div className="space-y-4 mb-6 relative z-10">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-700">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-lg bg-gray-700 p-2"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-400">${item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(totalPrice * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-700">
                <span>Total</span>
                <span>${(totalPrice * 1.08).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Checkout Form */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-500 opacity-10 blur-xl animate-pulse-slow pointer-events-none"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10">
              {/* Shipping Information */}
              {activeStep === 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingChange}
                          className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={handleShippingChange}
                          className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Information */}
              {activeStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Name on Card</label>
                      <input
                        type="text"
                        name="nameOnCard"
                        value={paymentInfo.nameOnCard}
                        onChange={handlePaymentChange}
                        className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Review Order */}
              {activeStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <p>{shippingInfo.fullName}</p>
                      <p>{shippingInfo.address}</p>
                      <p>{shippingInfo.city}, {shippingInfo.postalCode}</p>
                      <p>{shippingInfo.country}</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Payment Method</h3>
                      <p>Credit Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Order Items</h3>
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.name} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-600">
                        <span>Total:</span>
                        <span>${(totalPrice * 1.08).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {paymentError && (
                <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-lg">
                  {paymentError}
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {activeStep > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-700 rounded-lg font-bold hover:bg-gray-600 transition"
                  >
                    Back
                  </button>
                )}
                
                {activeStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`ml-auto px-6 py-3 rounded-xl font-bold text-lg transition relative overflow-hidden ${
                      isProcessing
                        ? "bg-blue-700 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 opacity-50 blur-xl filter animate-pulse-slow"></span>
                    <span className="relative z-10">
                      {isProcessing ? "Processing..." : `Pay $${(totalPrice * 1.08).toFixed(2)}`}
                    </span>
                  </button>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-400 text-center">
                This is a test payment system. No actual charges will be made.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}