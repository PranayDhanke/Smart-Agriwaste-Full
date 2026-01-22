import { CartItem } from "@/components/types/order";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface cartSlice {
  cart: CartItem[];
}

const initialState: cartSlice = {
  cart: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState: initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const exists = state.cart.find((i) => i.prodId === item.prodId);
      if (exists) {
        exists.quantity += item.quantity;
      } else {
        state.cart.push(item);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((i) => i.prodId !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        prodId: string;
        quantity: number;
        maxQuantity: number;
      }>,
    ) => {
      const { prodId, quantity, maxQuantity } = action.payload;

      const item = state.cart.find((i) => i.prodId === prodId);
      if (!item) {
        return;
      }

      if (quantity <= 0) {
        state.cart = state.cart.filter((i) => i.prodId !== prodId);
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
