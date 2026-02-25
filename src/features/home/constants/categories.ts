export interface Category {
  id: string;
  titleKey: string; // Translation key
  image: string;
}

export const FOOD_CATEGORIES: Category[] = [
  {
    id: '1',
    titleKey: 'categories.rice',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=160&h=160&fit=crop',
  },
  {
    id: '2',
    titleKey: 'categories.noodle',
    image:
      'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=160&h=160&fit=crop',
  },
  {
    id: '3',
    titleKey: 'categories.pho',
    image:
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=160&h=160&fit=crop',
  },
  {
    id: '4',
    titleKey: 'categories.coffee',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=160&h=160&fit=crop',
  },
  {
    id: '5',
    titleKey: 'categories.milk_tea',
    image:
      'https://images.unsplash.com/photo-1562440499-64e3f2085e04?w=160&h=160&fit=crop',
  },
  {
    id: '6',
    titleKey: 'categories.other',
    image:
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=160&h=160&fit=crop',
  },
];
