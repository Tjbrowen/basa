import { CartProductType } from "@/app/product/[productId]/ProductDetails";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import  { toast } from "react-hot-toast";


// Define the CartContextType
type CartContextType = {
  cartTotalQty: number;
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
};

// Create the CartContext with a default value
export const CartContext = createContext<CartContextType | null>(null);

interface Props {
  [propName: string]: any;
}

export const CartContextProvider = (props: Props) => {
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(null);

  useEffect(() => {
    const cartItems = localStorage.getItem("eShopCartItems");
    if (cartItems) {
      const parsedCartProducts: CartProductType[] = JSON.parse(cartItems);
      setCartProducts(parsedCartProducts);

      // Calculate the total quantity of items in the cart
      const totalQty = parsedCartProducts.reduce((total, product) => total + product.quantity, 0);
      setCartTotalQty(totalQty);
    }
  }, []);

  const handleAddProductToCart = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      let updatedCart;

      if (prev) {
        updatedCart = [...prev, product];
      } else {
        updatedCart = [product];
      }
       toast.success("Product added to cart")
      localStorage.setItem("eShopCartItems", JSON.stringify(updatedCart));

      // Update the total quantity of items in the cart
      const totalQty = updatedCart.reduce((total, item) => total + item.quantity, 0);
      setCartTotalQty(totalQty);

      return updatedCart;
    });
  }, []);

  const value = {
    cartTotalQty,
    cartProducts,
    handleAddProductToCart,
  };

  return <CartContext.Provider value={value} {...props} />;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error("useCart must be used within a CartContextProvider");
  }
  return context;
};
