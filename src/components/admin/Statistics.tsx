import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { adminService } from "@/services/admin";

export const Statistics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStatistics,
  });

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Statistiques générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total utilisateurs</p>
              <p className="text-2xl font-bold">{stats?.totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total annonces</p>
              <p className="text-2xl font-bold">{stats?.totalListings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Annonces cette semaine</p>
              <p className="text-2xl font-bold">{stats?.listingsThisWeek}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annonces par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.listingsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF6E14" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};