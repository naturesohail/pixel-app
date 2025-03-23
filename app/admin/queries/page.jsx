"use client"
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';

// interface Property {
//   _id: string;
//   propertyName: string;
//   location: string;
//   reraNo: string;
//   propertyType: string;
//   propertyPrice: string;
//   propertyStatus: string;
//   area: string;
//   bedrooms: number;
//   bathrooms: number;
//   amenities: string[];
//   specifications: string[];
// }

// interface Specification {
//   _id: string;
//   specificationName: string;
//   logo: string;
// }


// interface Amenity {
//   _id: string;
//   amenityName: string;
//   logo: string;
// }
const queries = [
  {
    id: 1,
    property: 'Property 1',
    name: 'John Doe',
    status: 'Active',
    actions: 'Actions'
  },
  {
    id: 2,
    property: 'Property 2',
    name: 'Jane Smith',
    status: 'Inactive',
    actions: 'Actions'
  },
  {
    id: 3,
    property: 'Property 3',
    name: 'John Doe',
    status: 'Active',
    actions: 'Actions'
  },
  
  
]

export default function Queries() {
  // const [isOpen, setIsOpen] = useState(false);
  // const [isEditOpen, setIsEditOpen] = useState(false);
  // const [properties, setProperties] = useState<Property[]>([]);
  // const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  // const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const [otherImagePreviews, setOtherImagePreviews] = useState<string[]>([]);
  // const [specifications, setSpecifications] = useState<Specification[]>([]);
  // const [amenities, setAmenities] = useState<Amenity[]>([]);
  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     const response = await fetch('/api/properties');
  //     const data = await response.json();
  //     console.log(data);
  //     setProperties(data);
  //   };
  //   fetchProperties();
  //   const fetchSpecifications = async () => {
  //     const response = await fetch('/api/specifications');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setSpecifications(data);
  //     }
  //   };
    
  //   fetchSpecifications();

  //   const fetchAmenities = async () => {
  //     const response = await fetch('/api/amenities');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setAmenities(data);
  //     }
  //   };
  //   fetchAmenities();
  // }, []);


  // const handleEdit = async (id: string, updatedProperty: Partial<Property>) => {
  //   const formData = new FormData();
  //   Object.keys(updatedProperty).forEach((key) => {
  //     const propertyKey = key as keyof Partial<Property>;
  //     formData.append(propertyKey, String(updatedProperty[propertyKey]));
  //   });

  //   const response = await fetch(`/api/properties?id=${id}`, {
  //     method: 'PUT',
  //     body: formData,
  //   });

  //   if (response.ok) {
  //     const updatedData = await response.json();
  //     setProperties(prev => prev.map(property => property._id === id ? updatedData : property));
  //     const propertyImage = updatedData.image;
  //     if (propertyImage) {
  //       const imageUrl = propertyImage;
  //       setImagePreview(imageUrl);
  //     }
  //   } else {
  //     console.error('Failed to update property');
  //   }
  // };

  // const handleDelete = async (id: string) => {
  //   const response = await fetch(`/api/properties?id=${id}`, {
  //     method: 'DELETE',
  //   });

  //   if (response.ok) {
  //     setProperties(prev => prev.filter(property => property._id !== id));
  //   } else {
  //     console.error('Failed to delete property');
  //   }
  // };

  // const confirmDelete = () => {
  //   if (propertyToDelete !== null) {
  //     handleDelete(propertyToDelete);
  //     setPropertyToDelete(null);
  //   }
  //   setIsDeleteOpen(false);
  // };

  // const handleAddProperty = async (formData: FormData) => {
  //   const response = await fetch('/api/properties', {
  //     method: 'POST',
  //     body: formData,
  //   });

  //   if (response.ok) {
  //     const addedProperty = await response.json();
  //     setProperties(prev => [...prev, addedProperty]);
  //   } else {
  //     console.error('Failed to add property');
  //   }
  // };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Queries</h1>
       
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status.</th>
              
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queries.map((query, index) => (
                <tr key={index} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{query.property}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{query.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{query.status}</div>
                  </td>
                  
                 


                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  );
}