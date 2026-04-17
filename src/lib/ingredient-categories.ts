export function getIngredientCategory(itemName: string): {
  category: string;
  emoji: string;
} {
  const name = itemName.toLowerCase().trim();

  const vegetables = ['potato', 'onion', 'tomato', 'garlic', 'ginger', 
    'carrot', 'capsicum', 'bell pepper', 'brinjal', 'eggplant', 
    'cauliflower', 'cabbage', 'spinach', 'palak', 'peas', 'beans', 
    'lady finger', 'okra', 'bhindi', 'radish', 'beetroot', 'corn', 
    'mushroom', 'cucumber', 'bottle gourd', 'lauki', 'pumpkin', 
    'bitter gourd', 'karela', 'drumstick', 'broccoli', 'zucchini',
    'lettuce', 'celery', 'asparagus', 'sweet potato', 'turnip',
    'spring onion', 'green chili', 'coriander leaves', 'curry leaves',
    'mint', 'cilantro', 'methi', 'fenugreek'];

  const fruits = ['lemon', 'lime', 'banana', 'apple', 'mango', 
    'orange', 'grapes', 'pomegranate', 'coconut', 'pineapple', 
    'watermelon', 'papaya', 'guava', 'berries', 'strawberry',
    'blueberry', 'avocado', 'tamarind', 'amla', 'dates', 'fig'];

  const grains = ['rice', 'wheat', 'flour', 'atta', 'maida', 
    'bread', 'roti', 'naan', 'pasta', 'noodles', 'oats', 
    'semolina', 'sooji', 'rava', 'poha', 'cornflour', 
    'breadcrumbs', 'tortilla', 'bun', 'pav', 'vermicelli',
    'spaghetti', 'penne', 'cereal', 'muesli', 'quinoa',
    'barley', 'bajra', 'jowar', 'ragi', 'dosa batter'];

  const dairy = ['milk', 'curd', 'yogurt', 'paneer', 'cheese', 
    'butter', 'ghee', 'cream', 'khoya', 'mawa', 'condensed milk',
    'buttermilk', 'chaas', 'whey', 'cottage cheese', 'mozzarella',
    'cheddar', 'parmesan', 'sour cream', 'egg', 'eggs'];

  const meat = ['chicken', 'mutton', 'lamb', 'goat', 'beef', 
    'pork', 'turkey', 'duck', 'bacon', 'sausage', 'ham',
    'salami', 'pepperoni', 'keema', 'mince'];

  const seafood = ['fish', 'prawn', 'shrimp', 'crab', 'lobster', 
    'squid', 'salmon', 'tuna', 'mackerel', 'pomfret', 'surmai',
    'rawas', 'bangda', 'rohu', 'hilsa'];

  const spices = ['turmeric', 'haldi', 'cumin', 'jeera', 'coriander', 
    'dhania', 'chili powder', 'red chili', 'black pepper', 'pepper',
    'mustard seeds', 'rai', 'cardamom', 'elaichi', 'clove', 'laung',
    'cinnamon', 'dalchini', 'bay leaf', 'tej patta', 'star anise',
    'fennel', 'saunf', 'nutmeg', 'jaiphal', 'mace', 'javitri',
    'asafoetida', 'hing', 'fenugreek seeds', 'methi dana',
    'garam masala', 'chaat masala', 'pav bhaji masala', 
    'biryani masala', 'sambhar masala', 'curry powder',
    'oregano', 'basil', 'thyme', 'rosemary', 'paprika',
    'saffron', 'kesar', 'ajwain', 'carom seeds', 'salt',
    'amchur', 'dry mango', 'kasuri methi', 'kasoori methi'];

  const lentils = ['dal', 'toor dal', 'moong dal', 'urad dal', 
    'chana dal', 'masoor dal', 'rajma', 'kidney beans', 'chole',
    'chickpeas', 'lobia', 'black eyed peas', 'soybean',
    'peanuts', 'groundnut', 'cashew', 'almond', 'walnut',
    'pistachio', 'raisin', 'dry fruits'];

  const oils = ['oil', 'cooking oil', 'olive oil', 'mustard oil', 
    'coconut oil', 'sesame oil', 'sunflower oil', 'vegetable oil',
    'vinegar', 'soy sauce', 'ketchup', 'mayonnaise', 'sauce',
    'honey', 'jaggery', 'sugar', 'maple syrup', 'jam',
    'pickle', 'chutney', 'paste', 'tomato paste', 'ginger paste',
    'garlic paste'];

  for (const item of vegetables) {
    if (name.includes(item)) return { category: 'Vegetables', emoji: '🥬' };
  }
  for (const item of fruits) {
    if (name.includes(item)) return { category: 'Fruits', emoji: '🍎' };
  }
  for (const item of grains) {
    if (name.includes(item)) return { category: 'Grains & Cereals', emoji: '🌾' };
  }
  for (const item of dairy) {
    if (name.includes(item)) return { category: 'Dairy & Eggs', emoji: '🥛' };
  }
  for (const item of meat) {
    if (name.includes(item)) return { category: 'Meat & Poultry', emoji: '🍗' };
  }
  for (const item of seafood) {
    if (name.includes(item)) return { category: 'Seafood', emoji: '🐟' };
  }
  for (const item of spices) {
    if (name.includes(item)) return { category: 'Spices & Masalas', emoji: '🌶️' };
  }
  for (const item of lentils) {
    if (name.includes(item)) return { category: 'Lentils & Pulses', emoji: '🫘' };
  }
  for (const item of oils) {
    if (name.includes(item)) return { category: 'Oils & Condiments', emoji: '🫒' };
  }

  return { category: 'Others', emoji: '📦' };
}
