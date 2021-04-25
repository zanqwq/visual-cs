// type Action = { type: string, payload: any }
// type ActionCreator = (...arg?) => Action

// 异步中间件 redux-thunk, toolkit 中的 configureStore 默认设置了它,
// 启用后, 可以 store.dispatch(asyncFunc: ())
// * type Thunk =
// * ThunkCreator: (...arg) => Thunk

// type Reducer = <S>(state: S, action: Action) => S
// import { configureStore } from "@reduxjs/toolkit"
// const store = configureStore({ reducer })
// store.dispatch, store.getState
// selector: (state) => any
// slice : a collection of redux reducer logic and actions for a single feature in our app

import { RootState /*, store */ } from "@/store";
import {
  // configureStore,
  // createAsyncThunk,
  createSlice,
  PayloadAction,
  // ThunkAction,
} from "@reduxjs/toolkit";
import { notification } from "antd";

interface UserState {
  name: string;
  login: boolean;
}

const name = localStorage.getItem("username") || "";
const login = !!name;
const initialState: UserState = {
  name,
  login,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      localStorage.setItem("username", action.payload);
      state.name = action.payload;
    },
    setLogin: (state, action: PayloadAction<boolean>) => {
      if (action.payload)
        notification.success({
          message: `Welcome to Visual CS!`,
          description:
            "Visual Computer Science is a platform that provides visual contents in cs region. \n Hope you can enjoy learning something here!",
        });
      state.login = action.payload;
    },
  },
});

// Thunk Test
// const thunk = (dispatch, getState) => {
//   // setTimeout(() => getState().users.name, 1000);
//   // dispatch();
// };
// const thunkCreator = (arg) => {
//   return async function (dispatch, getState) {};
// };

// const thunkCreator2 = createAsyncThunk("foo", () => {
//   return "123";
// });
// createSlice({
//   extraReducers: {
//     // [thunkCreator2.pending]: (state, action) => {}
//     // [thunkCreator2.fulfilled]: (state, action) => {}
//     // [thunkCreator2.rejected]: (state, action) => {}
//   },
//   or
//   extraReducers: (builder) => {
//      builder.addCase("foo", (state, action) => {  })
//   }
// })
// const thunkCreator3 = createAsyncThunk("bar", (arg, { dispatch, getState }) => {
//   return arg;
// });
// const thunk2 = thunkCreator2();
// const thunk3 = thunkCreator3("123");

export const { setName, setLogin } = userSlice.actions;
export const selectUserName = (state: RootState) => state.user.name;
export const selectLogin = (state: RootState) => state.user.login;
export default userSlice.reducer;
