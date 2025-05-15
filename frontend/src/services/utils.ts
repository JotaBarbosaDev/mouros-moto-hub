/**
 * Função utilitária para converter camelCase para snake_case
 */
export function camelToSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj) return {};
  
  const result: Record<string, unknown> = {};
  
  // Mapeamento direto de camelCase para snake_case
  const fieldMapping: Record<string, string> = {
    'name': 'name',
    'shortName': 'short_name',
    'foundingDate': 'founding_date',
    'logoUrl': 'logo_url',
    'bannerUrl': 'banner_url',
    'primaryColor': 'primary_color', // #e11d48
    'secondaryColor': 'secondary_color',
    'accentColor': 'accent_color',
    'textColor': 'text_color',
    'annualFee': 'annual_fee',
    'feeStartDate': 'fee_start_date',
    'address': 'address',
    'email': 'email',
    'phone': 'phone',
    'description': 'description',
    'welcomeMessage': 'welcome_message'
  };
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Usar o mapeamento ou converter o nome da propriedade
      const snakeKey = fieldMapping[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Tratamento especial para inactivePeriods
      if (key === 'inactivePeriods' && Array.isArray(obj[key])) {
        result['inactive_periods'] = obj[key].map((period) => ({
          start_date: period.startDate,
          end_date: period.endDate,
          reason: period.reason
        }));
      } 
      // Tratamento especial para socialMedia
      else if (key === 'socialMedia' && typeof obj[key] === 'object') {
        result['social_media'] = obj[key];
      }
      // Caso padrão
      else {
        result[snakeKey] = obj[key];
      }
    }
  }
  
  return result;
}
