import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@appica/ui-react/providers/theme-provider";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider
			themes={["light", "dark"]}
			defaultTheme="system"
			enableSystem
			storageKey="theme"
		>
			<App />
		</ThemeProvider>
	</StrictMode>,
);
