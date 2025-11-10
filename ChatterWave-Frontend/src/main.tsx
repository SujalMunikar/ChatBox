import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import "@fontsource/roboto"; // Defaults to weight 400
import "@fontsource/roboto/400.css"; // Specify weight
import "@fontsource/roboto/400-italic.css"; // Specify weight and style
// import { SocketContextProvider } from "./context/SocketContext.tsx";

// Bootstraps the React application with routing, Redux, and global styles.

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* <SocketContextProvider> */}
        {/* Socket context remains optional until the socket feature stabilizes. */}
        <App />
        {/* </SocketContextProvider> */}
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
