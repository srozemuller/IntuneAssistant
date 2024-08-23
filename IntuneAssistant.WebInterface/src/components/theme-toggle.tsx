import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const [theme, setThemeState] = React.useState<"theme-light" | "dark" | "system">("theme-light")

  const getThemePreference = () => {
    if (typeof localStorage !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || localStorage.getItem('starlight-theme');
      if (storedTheme) {
        return storedTheme;
      }
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const updateThemeState = (newTheme: "theme-light" | "dark" | "system") => {
    setThemeState(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      localStorage.setItem('starlight-theme', newTheme);
    }
  };

  React.useEffect(() => {
    const isDark = getThemePreference() === 'dark';
    setThemeState(isDark ? "dark" : "theme-light");

    const updateDocumentTheme = () => {
      const isDark =
          theme === "dark" ||
          (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList[isDark ? "add" : "remove"]("dark");
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    };

    updateDocumentTheme();
  }, [theme]);

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => updateThemeState("theme-light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateThemeState("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateThemeState("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}