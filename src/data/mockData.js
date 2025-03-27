// Mock data for development purposes

export const categories = [
  { id: 1, name: 'موبایل و تبلت', icon: 'mobile-alt', count: 120 },
  { id: 2, name: 'لپ تاپ و کامپیوتر', icon: 'laptop', count: 85 },
  { id: 3, name: 'لوازم خانگی', icon: 'home', count: 210 },
  { id: 4, name: 'لوازم الکترونیکی', icon: 'tv', count: 150 },
  { id: 5, name: 'وسایل نقلیه', icon: 'car', count: 90 },
  { id: 6, name: 'مبلمان و دکوراسیون', icon: 'couch', count: 135 },
  { id: 7, name: 'پوشاک', icon: 'tshirt', count: 180 },
  { id: 8, name: 'ورزشی و سرگرمی', icon: 'futbol', count: 70 }
];

export const cities = [
  'تهران',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'اهواز',
  'قم',
  'کرمانشاه',
  'رشت'
];

export const products = [
  {
    id: 1,
    title: 'گوشی سامسونگ گلکسی S21 کارکرده تمیز',
    description: 'گوشی در حد نو با کارکرد ۴ ماه، جعبه و لوازم جانبی کامل، بدون خط و خش، با گارانتی',
    price: 15000000,
    location: 'تهران',
    category: 'موبایل و تبلت',
    condition: 'در حد نو',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۳/۱۵',
    sellerName: 'علی محمدی',
    rating: 4.5,
    views: 120,
    negotiable: true
  },
  {
    id: 2,
    title: 'لپ تاپ اپل مک بوک پرو ۲۰۲۰',
    description: 'مک بوک پرو ۲۰۲۰ با پردازنده M1 و رم ۱۶ گیگابایت، هارد ۵۱۲ گیگابایت، در حد نو، کمتر از ۱ سال استفاده',
    price: 45000000,
    location: 'اصفهان',
    category: 'لپ تاپ و کامپیوتر',
    condition: 'کارکرده',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۳/۱۰',
    sellerName: 'مریم احمدی',
    rating: 4.8,
    views: 85,
    negotiable: false
  },
  {
    id: 3,
    title: 'تلویزیون ال جی ۵۵ اینچ ۴K',
    description: 'تلویزیون ال جی ۵۵ اینچ ۴K با کیفیت تصویر فوق العاده، دو سال کارکرد، در حد نو با کنترل اصلی و پایه',
    price: 22000000,
    location: 'مشهد',
    category: 'لوازم الکترونیکی',
    condition: 'کارکرده',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۳/۰۵',
    sellerName: 'رضا کریمی',
    rating: 4.2,
    views: 63,
    negotiable: true
  },
  {
    id: 4,
    title: 'دوچرخه کوهستان Specialized',
    description: 'دوچرخه کوهستان Specialized مدل Rockhopper سایز ۲۹ با دنده شیمانو، کمتر از ۶ ماه استفاده',
    price: 18000000,
    location: 'تهران',
    category: 'ورزشی و سرگرمی',
    condition: 'در حد نو',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۲/۲۰',
    sellerName: 'سعید نوروزی',
    rating: 4.7,
    views: 42,
    negotiable: true
  },
  {
    id: 5,
    title: 'مبل راحتی هفت نفره',
    description: 'مبل راحتی هفت نفره با پارچه مخمل ضد لک، خریداری شده در سال ۱۴۰۱، در حد نو، فقط به دلیل جابجایی به فروش می‌رسد',
    price: 28000000,
    location: 'شیراز',
    category: 'مبلمان و دکوراسیون',
    condition: 'کارکرده',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۲/۱۵',
    sellerName: 'زهرا محسنی',
    rating: 4.0,
    views: 78,
    negotiable: true
  },
  {
    id: 6,
    title: 'یخچال و فریزر ساید بای ساید سامسونگ',
    description: 'یخچال و فریزر ساید بای ساید سامسونگ با آبریز و یخساز، سه سال کارکرد، کاملا سالم، فقط چند خط جزئی روی بدنه',
    price: 35000000,
    location: 'تبریز',
    category: 'لوازم خانگی',
    condition: 'کارکرده',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۲/۰۸',
    sellerName: 'امیر حسینی',
    rating: 3.9,
    views: 56,
    negotiable: true
  },
  {
    id: 7,
    title: 'پراید ۱۳۱ مدل ۹۷',
    description: 'پراید ۱۳۱ مدل ۹۷، رنگ سفید، بدون تصادف، فنی سالم، بیمه یک سال کامل، لاستیک ۶۰ درصد',
    price: 165000000,
    location: 'کرج',
    category: 'وسایل نقلیه',
    condition: 'کارکرده',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۱/۲۵',
    sellerName: 'حسین عباسی',
    rating: 4.1,
    views: 110,
    negotiable: false
  },
  {
    id: 8,
    title: 'کت و شلوار مردانه سایز ۵۲',
    description: 'کت و شلوار مردانه مارک LRC، سایز ۵۲، رنگ سرمه‌ای، فقط یک بار استفاده شده، همراه با کراوات ست',
    price: 4500000,
    location: 'اصفهان',
    category: 'پوشاک',
    condition: 'در حد نو',
    image: 'https://via.placeholder.com/400x300',
    date: '۱۴۰۲/۰۱/۱۸',
    sellerName: 'مجید رضایی',
    rating: 4.4,
    views: 38,
    negotiable: true
  }
];

export const featuredProducts = products.slice(0, 4);
