import { CartItem } from "@/components/types/order";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface cartSlice {
  cart: CartItem[];
}

const initialState: cartSlice = {
  cart: [],
};

const getCartItemId = (item: CartItem) => item.cartItemId ?? item.prodId;

export const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const itemId = getCartItemId(item);
      const exists = state.cart.find((i) => getCartItemId(i) === itemId);
      if (exists) {
        exists.quantity += item.quantity;
      } else {
        state.cart.push({
          ...item,
          cartItemId: itemId,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<{ cartItemId: string }>) => {
      state.cart = state.cart.filter(
        (i) => getCartItemId(i) !== action.payload.cartItemId,
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        cartItemId: string;
        quantity: number;
        maxQuantity: number;
      }>,
    ) => {
      const { cartItemId, quantity, maxQuantity } = action.payload;

      const item = state.cart.find((i) => getCartItemId(i) === cartItemId);
      if (!item) {
        return;
      }

      if (quantity <= 0) {
        state.cart = state.cart.filter((i) => getCartItemId(i) !== cartItemId);
        return;
      }
      if (quantity > maxQuantity) {
        toast.error(`Cannot exceed available stock of ${maxQuantity}.`);
        return;
      }

      item.quantity = quantity;
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const { addToCart, clearCart, removeFromCart, updateQuantity } =
  cartSlice.actions;

export default cartSlice.reducer;
