import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";

const recentListings = [
  {
    id: 1,
    title: "Appartement F3 lumineux",
    price: "180 000 CFA",
    location: "Yaoundé, Cameroun",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    timePosted: "Il y a 30 minutes"
  },
  {
    id: 2,
    title: "Toyota Corolla 2019",
    price: "8 500 000 CFA",
    location: "Douala, Cameroun",
    image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
    timePosted: "Il y a 1 heure"
  },
  {
    id: 3,
    title: "iPhone 13 Pro Max",
    price: "450 000 CFA",
    location: "Bafoussam, Cameroun",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    timePosted: "Il y a 2 heures"
  },
  {
    id: 4,
    title: "Vélo tout terrain",
    price: "120 000 CFA",
    location: "Kribi, Cameroun",
    image: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2",
    timePosted: "Il y a 3 heures"
  }
];

export const RecentListings = () => {
  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6">Annonces récentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentListings.map((listing) => (
          <Link
            key={listing.id}
            to={`/listings/${listing.id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={listing.image}
                alt={listing.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1 text-sm">
                {listing.timePosted}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary">
                    {listing.title}
                  </h3>
                  <p className="text-primary font-bold mt-2">{listing.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};