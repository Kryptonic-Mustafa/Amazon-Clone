"use client";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Amazon<span className="text-yellow-400">Clone</span>
          </h2>
          <p className="text-sm text-gray-400">
            The best place to buy everything you need with comma-separated reliability.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-bold mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/shop" className="hover:text-yellow-400">All Products</a></li>
            <li><a href="/shop?filter=sale" className="hover:text-yellow-400">Best Sellers</a></li>
            <li><a href="/shop?filter=new" className="hover:text-yellow-400">New Arrivals</a></li>
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
            <FaFacebook className="hover:text-blue-500 cursor-pointer" />
            <FaTwitter className="hover:text-blue-400 cursor-pointer" />
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            <FaLinkedin className="hover:text-blue-700 cursor-pointer" />
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-8">
        &copy; {new Date().getFullYear()} AmazonClone Enterprise. All rights reserved.
      </div>
    </footer>
  );
}