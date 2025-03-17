import { useQuery } from "@tanstack/react-query";
import { Image } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: photos } = useQuery<Image[]>({
    queryKey: ["/api/images/photo"],
  });

  const { data: vectors } = useQuery<Image[]>({
    queryKey: ["/api/images/vector"],
  });

  const { data: illustrations } = useQuery<Image[]>({
    queryKey: ["/api/images/illustration"],
  });

  const addToCart = async (imageId: number) => {
    await apiRequest("POST", "/api/cart", { imageId });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">StockImage</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/cart">
                  <Button variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/auth">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="photos">
          <TabsList className="mb-8">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="vectors">Vectors</TabsTrigger>
            <TabsTrigger value="illustrations">Illustrations</TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos?.map((photo) => (
                <Card key={photo.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{photo.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      ${photo.price}
                    </span>
                    <Button
                      onClick={() => addToCart(photo.id)}
                      disabled={!user}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vectors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vectors?.map((vector) => (
                <Card key={vector.id}>
                  {/* Similar structure to photos */}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="illustrations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {illustrations?.map((illustration) => (
                <Card key={illustration.id}>
                  {/* Similar structure to photos */}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
