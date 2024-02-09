declare global {
    interface Window {
      onSignInSuccess: (data: any) => void;
    }
  }
  
  export {};