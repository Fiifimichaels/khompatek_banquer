declare global {
  interface Window {
    UssdBridge: {
      isAccessibilityServiceEnabled(): boolean;
      openAccessibilitySettings(): void;
      setupTransaction(type: string, phone: string, amount: string, pin: string): boolean;
      dialUssdWithAutomation(ussd: string, type: string, phone: string, amount: string, pin: string): boolean;
      enableAutomation(): void;
      disableAutomation(): void;
      isAutomationEnabled(): boolean;
      resetAutomation(): void;
      getAutomationStatus(): string;
      log(message: string): void;
    };
  }
}

export {};