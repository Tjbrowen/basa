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
  children: React.ReactNode;
}

export const CartContextProvider = ({ children }: Props) => {
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(
    null
  );
  const [showAddToast, setShowAddToast] = useState(false);
  const [showRemoveToast, setShowRemoveToast] = useState(false);

  useEffect(() => {
    const cartItems = localStorage.getItem("eShopCartItems");
    if (cartItems) {
      const parsedCartProducts: CartProductType[] = JSON.parse(cartItems);
      setCartProducts(parsedCartProducts);
    }
  }, []);

  useEffect(() => {
    if (cartProducts) {
      const { totalQty, totalAmount } = cartProducts.reduce(
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
  }, [cartProducts]);

  useEffect(() => {
    if (showAddToast) {
      toast.success("Product added to cart");
      setShowAddToast(false);
    }
  }, [showAddToast]);

  useEffect(() => {
    if (showRemoveToast) {
      toast.success("Product removed from cart");
      setShowRemoveToast(false);
    }
  }, [showRemoveToast]);

  const handleAddProductToCart = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      const updatedCart = prev ? [...prev, product] : [product];
      localStorage.setItem("eShopCartItems", JSON.stringify(updatedCart));
      setShowAddToast(true);
      return updatedCart;
    });
  }, []);

  const handleRemoveProductFromCart = useCallback(
    (product: CartProductType) => {
      setCartProducts((prev) => {
        if (!prev) return prev;
        const updatedCart = prev.filter((item) => item.id !== product.id);
        localStorage.setItem("eShopCartItems", JSON.stringify(updatedCart));
        setShowRemoveToast(true);
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
      localStorage.setItem("eShopCartItems", JSON.stringify(updatedCart));
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
      localStorage.setItem("eShopCartItems", JSON.stringify(updatedCart));
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error("useCart must be used within a CartContextProvider");
  }
  return context;
};
