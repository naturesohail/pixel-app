'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Spinner } from '@/app/utills/Spinner';
export default function SettingsPage() {
  const { user } = useAuth();
  const [stripePK, setStripePK] = useState('');
  const [stripeSK, setStripeSK] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        setStripePK(data.stripePK || '');
        setStripeSK(data.stripeSK || '');
      } catch (error) {
        console.error('Error fetching settings:', error);
        setErrorMessage('Failed to load settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   

    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripePK, stripeSK })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }
      
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrorMessage(error.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="ml-64 p-8"> {/* Adjusted for sidebar */}
      <div className="max-w-4xl mx-auto"> {/* 8-column width */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <Spinner/>
                <p className="mt-4 text-gray-600">Loading settings...</p>
              </div>
            </div>
          ) : (
            <>
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    value={stripePK}
                    onChange={(e) => setStripePK(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pk_key_..."
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stripe Secret Key
                  </label>
                  <input
                    type="text"
                    value={stripeSK}
                    onChange={(e) => setStripeSK(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sk_key_..."
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}