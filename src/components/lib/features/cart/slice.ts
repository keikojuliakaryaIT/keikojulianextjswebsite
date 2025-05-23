import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
interface CartState {
  items: any[];
  customer: {
    name: string;
    email: string;
    address: string;
  };
	companyPayment:{
		name:string,
		Uennumber:string,
		address:string,
	}
}

// Define the initial state using that type
const initialState: CartState = {
  items: [],
  customer: {
    name: "",
    email: "",
    address: "",
  },
	companyPayment:{
		name:'Keiko Julia Pte Ltd',
		Uennumber:'202327971C',
		address:'34 Boon Leat Terrace #04-19B S119866'
	}
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
			console.log('temp ',temp)
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
    changeCustomerName: (state, action: PayloadAction<any>) => {
      state.customer.name = action.payload;
    },
    changeCustomerEmail: (state, action: PayloadAction<any>) => {
      state.customer.email = action.payload;
    },
    changeCustomerAddress: (state, action: PayloadAction<any>) => {
      state.customer.address = action.payload;
    },
		changeCustomerData: (state, action: PayloadAction<any>) => {
      state.customer = action.payload;
    },
  },
});

export const { addCart, clearCart, changeStock, deleteStock ,changeCustomerData} =
  cartSlice.actions;

// Other code such as selectors can use the imported `RootState` type

export default cartSlice.reducer;
