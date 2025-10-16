/// <reference types="vite/client" />

// Facebook SDK types
declare global {
  interface Window {
    FB: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (callback: (response: any) => void, options?: { scope: string }) => void;
      getLoginStatus: (callback: (response: any) => void) => void;
      logout: (callback: (response: any) => void) => void;
      XFBML: {
        parse: (element?: HTMLElement) => void;
      };
      AppEvents: {
        logPageView: () => void;
      };
    };
  }
}

export {};
