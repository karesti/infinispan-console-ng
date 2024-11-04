import React, { useEffect, useState } from 'react';
import { getInitialTheme } from '@app/utils/themeUtils';
import { githubGist, dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export const DARK = 'dark';
export const LIGHT = 'light';

const initialState = {
  theme: '',
  toggleTheme: (light: boolean) => {},
  syntaxHighLighterTheme: ''
};

export const ThemeContext = React.createContext(initialState);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const syntaxHighLighterTheme = theme === DARK ? dracula : githubGist;

  useEffect(() => {
    if (theme === DARK) {
      document.documentElement.classList.add('pf-v6-theme-dark');
    } else {
      document.documentElement.classList.remove('pf-v6-theme-dark');
    }

    if (localStorage) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = (light: boolean) => {
    setTheme(light ? LIGHT : DARK);
  };
  const themeState = {
    theme,
    toggleTheme,
    syntaxHighLighterTheme
  };
  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
};

export { ThemeProvider };
