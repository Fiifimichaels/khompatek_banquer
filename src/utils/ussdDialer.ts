export interface USSDDialResult {
  success: boolean;
  message: string;
  reference?: string;
}

export const dialUSSD = async (ussdCode: string, simSlot: number = 1): Promise<USSDDialResult> => {
  try {
    // Check if we're on a mobile device with dialer capabilities
    if (!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
      return {
        success: false,
        message: 'USSD dialing is only available on mobile devices'
      };
    }

    // Create the tel: URL with USSD code
    let telUrl = `tel:${encodeURIComponent(ussdCode)}`;
    
    // For Android devices with dual SIM support
    if (navigator.userAgent.includes('Android')) {
      // Try to specify SIM slot for Android (some devices support this)
      // Different manufacturers use different approaches
      const androidIntents = [
        `intent://call/?phone=${encodeURIComponent(ussdCode)}&sim=${simSlot}#Intent;scheme=tel;package=com.android.phone;end`,
        `intent://call/?phone=${encodeURIComponent(ussdCode)}&slot=${simSlot - 1}#Intent;scheme=tel;package=com.android.dialer;end`,
        telUrl // Fallback to standard tel: protocol
      ];

      // Try the first intent approach
      try {
        window.location.href = androidIntents[0];
        return {
          success: true,
          message: `USSD code sent to dialer using SIM ${simSlot}`,
          reference: `USSD_${Date.now()}`
        };
      } catch (error) {
        // Fallback to standard tel: protocol
        window.location.href = telUrl;
        return {
          success: true,
          message: `USSD code sent to dialer (SIM ${simSlot} - manual selection may be required)`,
          reference: `USSD_${Date.now()}`
        };
      }
    }
    
    // For iOS devices, the tel: protocol works but may have limitations
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      // iOS doesn't support SIM selection via URL schemes
      window.location.href = telUrl;
      
      return {
        success: true,
        message: `USSD code sent to dialer (iOS - please select SIM ${simSlot} manually)`,
        reference: `USSD_${Date.now()}`
      };
    }

    // Fallback for other mobile browsers
    window.location.href = telUrl;
    
    return {
      success: true,
      message: `USSD code sent to dialer (please select SIM ${simSlot} manually if prompted)`,
      reference: `USSD_${Date.now()}`
    };
    
  } catch (error) {
    console.error('Error dialing USSD:', error);
    return {
      success: false,
      message: 'Failed to dial USSD code. Please dial manually.'
    };
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};