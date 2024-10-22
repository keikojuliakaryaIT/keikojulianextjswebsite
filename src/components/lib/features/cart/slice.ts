import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
interface CartState {
  items: any[];
}

// Define the initial state using that type
const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addCart: (state, action: PayloadAction<any>) => {
      state.items.push(action.payload);
    },
    changeStock: (
      state,
      action: PayloadAction<{ index: number; value: string }>
    ) => {
      let temp = [...state.items];
      temp[action.payload?.index].stockOut = Number(action.payload?.value);
      state.items = temp;
    },
    deleteStock: (state, action: PayloadAction<any>) => {
      let temp = state.items?.filter((data) => {
        return data.idProduct !== action.payload?.idProduct;
      });
      state.items = temp;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addCart, clearCart, changeStock, deleteStock } =
  cartSlice.actions;

// Other code such as selectors can use the imported `RootState` type

export default cartSlice.reducer;
