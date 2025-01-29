import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SubcategoryListings } from "@/components/SubcategoryListings";

const SubcategoryPage = () => {
  const { categoryId, subcategoryId } = useParams<{ categoryId: string; subcategoryId: string }>();

  if (!categoryId || !subcategoryId) {
    return <div>Paramètres manquants</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <SubcategoryListings categoryId={categoryId} subcategoryId={subcategoryId} />
      <Footer />
    </div>
  );
};

export default SubcategoryPage;