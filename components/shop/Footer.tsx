"use client";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        
        {/* Newsletter Row */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between border border-gray-700 shadow-lg">
          <div className="mb-6 md:mb-0 md:mr-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Subscribe to our Newsletter</h3>
            <p className="text-gray-400 text-sm">Get the latest updates on new products and upcoming sales.</p>
          </div>
          <form className="flex w-full md:w-auto flex-1 max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-gray-900 border border-gray-700 rounded-l-lg py-3 px-4 text-white focus:outline-none focus:border-yellow-400"
              required
            />
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-r-lg transition-colors">
              Subscribe
            </button>
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Amazon<span className="text-yellow-400">Clone</span>
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              The best place to buy everything you need with absolute reliability.
            </p>
            {/* Payment Methods */}
            <div className="flex space-x-3 text-2xl text-gray-400">
              <FaCcVisa className="hover:text-white transition-colors" />
              <FaCcMastercard className="hover:text-white transition-colors" />
              <FaCcPaypal className="hover:text-white transition-colors" />
              <FaCcAmex className="hover:text-white transition-colors" />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/shop" className="hover:text-yellow-400">All Products</a></li>
              <li><a href="/shop" className="hover:text-yellow-400">Best Sellers</a></li>
              <li><a href="/shop" className="hover:text-yellow-400">New Arrivals</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-400">Track Order</a></li>
              <li><a href="#" className="hover:text-yellow-400">Return Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400">Customer Service</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4 text-xl">
              <FaFacebook className="hover:text-blue-500 cursor-pointer transition-colors" />
              <FaTwitter className="hover:text-blue-400 cursor-pointer transition-colors" />
              <FaInstagram className="hover:text-pink-500 cursor-pointer transition-colors" />
              <FaLinkedin className="hover:text-blue-700 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-8 mt-4">
          &copy; {new Date().getFullYear()} AmazonClone Enterprise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}