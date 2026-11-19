export const themes = [
  { id:'minimal-pro', name:'Minimal Pro', category:'Professional', description:'Elegant monochrome productivity with restrained borders and compact structure.', colors:['#ffffff','#24272d','#9ba4ae','#5c6675'] },
  { id:'dark-futuristic', name:'Dark Futuristic', category:'Technology', description:'Atmospheric dark surfaces, glassy panels, neon accents and luminous feedback.', colors:['#080b12','#151a25','#8b5cf6','#38d9a9'] },
  { id:'creative-studio', name:'Creative Studio', category:'Editorial', description:'Expressive editorial typography, asymmetric composition and bold citrus accents.', colors:['#fffaf0','#20201c','#ff5c35','#f5c94a'] },
  { id:'glassmorphism', name:'Glassmorphism', category:'Premium', description:'Frosted floating surfaces over soft lavender and peach gradients.', colors:['#eef2ff','#ffffff','#8b74db','#b5a9ff'] },
  { id:'modern-saas', name:'Modern SaaS', category:'Productivity', description:'Structured blue-violet interfaces designed for fast, everyday workflows.', colors:['#f5f8ff','#ffffff','#4f63d8','#93a4ee'] },
  { id:'academic-ivory', name:'Academic Ivory', category:'Research', description:'A refined paper-inspired workspace for citations, manuscripts and literature review.', colors:['#fbfaf6','#ece8dc','#356859','#c6a15b'] },
  { id:'midnight-indigo', name:'Midnight Indigo', category:'Focus', description:'A calm, deep-indigo productivity canvas with precise violet accents.', colors:['#111329','#1b1d3c','#8d83c6','#67b7bd'] },
  { id:'warm-editorial', name:'Warm Editorial', category:'Publishing', description:'A bookish terracotta and cream system for writers, editors and publishers.', colors:['#f7f1e8','#fffaf4','#b84a39','#d7a35d'] },
];

export const defaultCustomization = {
  primary:'', secondary:'', accent:'', background:'', surface:'', text:'', border:'',
  mode:'system', sidebar:'expanded', fixed:true, spacing:'comfortable',
  font:'DM Sans', headingSize:34, bodySize:15, fontWeight:600,
  radius:12, shadows:true, borderIntensity:1, animation:'normal',
};

export function loadThemePreferences() {
  if (typeof window === 'undefined') return { template:'modern-saas', customization:defaultCustomization };
  try {
    return {
      template: localStorage.getItem('deepwrite-template') || 'modern-saas',
      customization: { ...defaultCustomization, ...JSON.parse(localStorage.getItem('deepwrite-customization') || '{}') },
    };
  } catch {
    return { template:'modern-saas', customization:defaultCustomization };
  }
}
