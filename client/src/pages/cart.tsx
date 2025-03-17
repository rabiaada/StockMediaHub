import { useQuery } from "@tanstack/react-query";
import { CartItem, Image } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();

  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: images } = useQuery<Image[]>({
    queryKey: ["/api/images"],
  });

  const removeFromCart = async (id: number) => {
    await apiRequest("DELETE", `/api/cart/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  const getImageDetails = (imageId: number) => {
    return images?.find((img) => img.id === imageId);
  };

  const calculateTotal = () => {
    return cartItems?.reduce((total, item) => {
      const image = getImageDetails(item.imageId);
      return total + (image ? parseFloat(image.price.toString()) : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Your cart is empty</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {cartItems?.map((item) => {
              const image = getImageDetails(item.imageId);
              if (!image) return null;

              return (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{image.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-32 h-32 object-cover rounded-md"
                    />
                    <div>
                      <p className="text-muted-foreground">
                        {image.description}
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        ${image.price}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}

            <Card>
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    ${calculateTotal()?.toFixed(2)}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Proceed to Checkout</Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
