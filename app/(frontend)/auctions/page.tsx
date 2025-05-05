"use client";
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

const stripePromise = loadStripe("pk_test_51R7u7XFWt2YrxyZwQ7kODs2zn8kBC3rbqOf8bU4JfAvtyyWpd96TYtikYji8oyP04uClsnEqxlg0ApdiImX4Xhtm00NGDkbha9");

export default function PixelMarketplace() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [pixelCount, setPixelCount] = useState(1);
  const [product, setProduct] = useState({
    title: '',
    description: '',
    images: [] as File[], // Store File objects instead of URLs
    url: ''
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Store File objects for upload
    setProduct(prev => ({ ...prev, images: files }));

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePurchase = async () => {
    if (!isLoggedIn || !user) {
      Swal.fire({
        title: 'Login Required',
        text: 'You need to login to purchase pixels',
        icon: 'warning',
        confirmButtonText: 'Login'
      }).then(() => router.push('/login'));
      return;
    }

    if (!product.title || !product.description || product.images.length === 0) {
      Swal.fire({
        title: 'Incomplete Form',
        text: 'Please fill all required fields and upload at least one image',
        icon: 'error'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Convert images to base64 for API
      const imagePromises = product.images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const imageBase64 = await Promise.all(imagePromises);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          pixelCount,
          totalPrice: pixelCount * 0.01, // Adjust based on your pricing
          productData: {
            ...product,
            images: imageBase64
          },
          isOneTimePurchase: true
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process payment');

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: data.id });

    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to process payment',
        icon: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Purchase Advertising Pixels</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pixel Information</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Number of Pixels</label>
          <input 
            type="number" 
            min="1" 
            value={pixelCount}
            onChange={(e) => setPixelCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">Minimum {pixelCount} pixel(s) at $0.01 each</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Ad Title*</label>
          <input
            type="text"
            value={product.title}
            onChange={(e) => setProduct({...product, title: e.target.value})}
            className="w-full p-2 border rounded"
            required
            placeholder="Your product or brand name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Ad Description*</label>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({...product, description: e.target.value})}
            className="w-full p-2 border rounded"
            rows={3}
            required
            placeholder="Describe what you're advertising"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Ad Images*</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">Upload images that will appear on your pixels</p>
          
          <div className="flex flex-wrap gap-4 mt-3">
            {previewImages.map((img, i) => (
              <div key={i} className="relative w-24 h-24 border rounded overflow-hidden">
                <Image
                  src={img}
                  alt="Ad preview"
                  fill
                  className="object-cover"
                  onLoad={() => URL.revokeObjectURL(img)} // Clean up memory
                />
                <button 
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Destination URL</label>
          <input
            type="url"
            value={product.url}
            onChange={(e) => setProduct({...product, url: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="https://yourwebsite.com"
          />
          <p className="text-sm text-gray-500 mt-1">Where users will go when clicking your ad</p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={isProcessing || !product.title || !product.description || product.images.length === 0}
          className={`w-full py-3 px-4 rounded font-medium ${
            isProcessing || !product.title || !product.description || product.images.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isProcessing ? 'Processing...' : `Purchase ${pixelCount} Pixel${pixelCount !== 1 ? 's' : ''} for $${(pixelCount * 0.01).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}