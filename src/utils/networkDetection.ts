export const detectNetworkFromNumber = (phoneNumber: string): string => {
  const prefix = phoneNumber.substring(0, 3);
  
  // MTN prefixes: 024, 054, 025, 059
  if (['024', '054', '025', '059'].includes(prefix)) {
    return 'MTN';
  }
  
  // Vodafone/Telecel prefixes: 020, 050
  if (['020', '050'].includes(prefix)) {
    return 'VODAFONE';
  }
  
  // AirtelTigo prefixes: 027, 057
  if (['027', '057'].includes(prefix)) {
    return 'AIRTELTIGO';
  }
  
  return 'UNKNOWN';
};

export const validateGhanaianNumber = (phoneNumber: string): boolean => {
  // Check if it's a valid 10-digit Ghanaian number with correct prefixes
  const pattern = /^0(24|54|25|59|20|50|27|57)[0-9]{7}$/;
  return pattern.test(phoneNumber);
};

export const getNetworkColor = (network: string): string => {
  switch (network) {
    case 'MTN':
      return 'text-yellow-600';
    case 'VODAFONE':
      return 'text-red-600';
    case 'AIRTELTIGO':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export const getNetworkDisplayName = (network: string): string => {
  switch (network) {
    case 'MTN':
      return 'MTN';
    case 'VODAFONE':
      return 'Vodafone/Telecel';
    case 'AIRTELTIGO':
      return 'AirtelTigo';
    default:
      return 'Unknown Network';
  }
};

export const getAllNetworks = (): string[] => {
  return ['MTN', 'VODAFONE', 'AIRTELTIGO'];
};

export const getNetworkPrefixes = (network: string): string[] => {
  switch (network) {
    case 'MTN':
      return ['024', '054', '025', '059'];
    case 'VODAFONE':
      return ['020', '050'];
    case 'AIRTELTIGO':
      return ['027', '057'];
    default:
      return [];
  }
};