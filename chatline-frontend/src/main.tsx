import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import "@fontsource/roboto"; // Defaults to weight 400
import "@fontsource/roboto/400.css"; // Explicit regular weight for consistency across browsers.
import "@fontsource/roboto/400-italic.css"; // Pulls in the matching italic variant.
// import { SocketContextProvider } from "./context/SocketContext.tsx";

// Bootstraps the React application with routing, Redux, and global styles.

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* StrictMode surfaces potential lifecycle issues during development. */}
    <Provider store={store}>
      {/* Redux provider exposes the global store to every component. */}
      <BrowserRouter>
        {/* BrowserRouter gives us history + route matching in the browser environment. */}
        {/* <SocketContextProvider> */}
        {/* Socket context remains optional until the socket feature stabilizes. */}
        <App />
        {/* </SocketContextProvider> */}
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
