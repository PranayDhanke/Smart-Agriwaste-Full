import { RootState } from "../store";

export const selectCartItems = (state: RootState) => {
  state.cart.cart;
};

export const selectTotalAmount = (state: RootState) =>
  state.cart.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
