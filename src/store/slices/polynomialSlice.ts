import { createSlice } from "@reduxjs/toolkit";

interface PolynomialState {
  polynomial: boolean;
}

const initialState: PolynomialState = {
  polynomial: false,
};

const polynomialSlice = createSlice({
  name: "polynomial",
  initialState,
  reducers: {
    setPolynomial: (state, action) => {
      state.polynomial = action.payload;
    },
  },
});

export const { setPolynomial } = polynomialSlice.actions;

export default polynomialSlice.reducer;
