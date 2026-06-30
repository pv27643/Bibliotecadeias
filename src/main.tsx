
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import App from "./app/App.tsx";
import { AppProvider } from "./context/AppContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallback={
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Algo correu mal</h2>
      <p>Recarrega a página para tentar de novo.</p>
      <button onClick={() => window.location.reload()}>Recarregar</button>
    </div>
  }>
    <AppProvider>
      <App />
    </AppProvider>
  </ErrorBoundary>
);
  