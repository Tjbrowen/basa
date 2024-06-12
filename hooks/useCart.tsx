import { CartProductType } from "@/app/product/[productId]/ProductDetails";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-hot-toast";

// Define the CartContextType
type CartContextType = {
  cartTotalQty: number;
  cartTotalAmount: number;
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveProductFromCart: (product: CartProductType) => void;
  handleCartQtyIncrease: (product: CartProductType) => void;
  handleCartQtyDecrease: (product: CartProductType) => void;
};

// Create the CartContext with a default value
export const CartContext = createContext<CartContextType | null>(null);

interface Props {
  [propName: string]: any;
}

export const CartContextProvider = (props: Props) => {
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(
    null
  );

  useEffect(() => {
    const cartItems = localStorage.getItem("eShopCartItems");
    if (cartItems) {
      const parsedCartProducts: CartProductType[] = JSON.parse(cartItems);
      setCartProducts(parsedCartProducts);

      // Calculate the total quantity and amount of items in the cart
      const { totalQty, totalAmount } = parsedCartProducts.reduce(
        (acc, product) => {
          acc.totalQty += product.quantity;
          acc.totalAmount += product.price * product.quantity;
          return acc;
        },
        { totalQty: 0, totalAmount: 0 }
      );

      setCartTotalQty(totalQty);
      setCartTotalAmount(totalAmount);
    }
  }, []);

  useEffect(() => {
    if (cartProducts) {
      const totalQty = cartProducts.reduce(
        (acc, product) => acc + product.quantity,
        0
      );
      const totalAmount = cartProducts.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      );
      setCartTotalQty(totalQty);
      setCartTotalAmount(totalAmount);
    }
  }, [cartProducts]);

  const handleAddProductToCart = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      const updatedCart = prev ? [...prev, product] : [product];
      toast.success("Product added to cart");
      localStorage.setItem("eShopCartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, []);

  const handleRemoveProductFromCart = useCallback(
    (product: CartProductType) => {
      setCartProducts((prev) => {
        if (!prev) return prev;
        const updatedCart = prev.filter((item) => item.id != product.id);
        toast.success("Product removed from cart");
        localStorage.setItem("eShopCartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    },
    []
  );

  const handleCartQtyIncrease = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      if (!prev) return prev;
      const updatedCart = prev.map((item) =>
        item.id === product.id && item.quantity < 99
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      return updatedCart;
    });
  }, []);

  const handleCartQtyDecrease = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      if (!prev) return prev;
      const updatedCart = prev.map((item) =>
        item.id === product.id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      return updatedCart;
    });
  }, []);

  const value = {
    cartTotalQty,
    cartTotalAmount,
    cartProducts,
    handleAddProductToCart,
    handleRemoveProductFromCart,
    handleCartQtyIncrease,
    handleCartQtyDecrease,
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
