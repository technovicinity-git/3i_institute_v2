let googleScriptLoaded = false;
let googleInitialized = false;
let appleScriptLoaded = false;

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });
}

export function isGoogleInitialized(): boolean {
  return googleInitialized;
}

export function setGoogleInitialized(value: boolean): void {
  googleInitialized = value;
}
export function loadAppleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (appleScriptLoaded) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      appleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Apple SDK"));
    document.head.appendChild(script);
  });
}

interface AppleIDAuth {
  init: (config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    usePopup?: boolean;
  }) => void;
  signIn: () => Promise<{
    authorization: {
      id_token: string;
      code: string;
      state: string;
    };
    user?: {
      email: string;
      name?: {
        firstName?: string;
        lastName?: string;
      };
    };
  }>;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme: string; size: string; width?: string },
          ) => void;
          prompt: () => void;
        };
      };
    };
    AppleID?: AppleIDAuth;
  }
}
