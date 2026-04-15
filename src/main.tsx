import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";
import "react-day-picker/style.css";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível. Atualizar agora?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Odonto PRO está pronto para funcionar offline.');
  },
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);
