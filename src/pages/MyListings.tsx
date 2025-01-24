import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Edit, Trash, Eye, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - replace with real data from your backend
const mockListings = [
  {
    id: 1,
    title: "iPhone 13 Pro",
    price: "800 €",
    createdAt: "2024-01-15",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
    status: "active"
  },
  // Add more mock listings as needed
];

const MyListings = () => {
  const [listings, setListings] = useState(mockListings);

  const handleDelete = (id: number) => {
    // Add confirmation dialog and API call here
    setListings(listings.filter(listing => listing.id !== id));
  };

  const handleRenew = (id: number) => {
    // Add API call to renew listing
    console.log("Renewing listing", id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Mes annonces</h1>
            
            <div className="space-y-6">
              {listings.map((listing) => (
                <div 
                  key={listing.id}
                  className="flex items-center justify-between border-b pb-6 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium">{listing.title}</h3>
                      <p className="text-[#FF6E14] font-bold">{listing.price}</p>
                      <p className="text-sm text-gray-500">
                        Publiée le {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-green-600">
                        {listing.status === 'active' ? 'Active' : 'Expirée'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link to={`/listings/${listing.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link to={`/listings/${listing.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRenew(listing.id)}
                    >
                      <RotateCw className="h-4 w-4 text-green-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyListings;