import { CategoryItemType, FoodItemType } from '@/types/generalTypes'
import {
  GiBowlOfRice,
  GiCook,
  GiGlassShot,
  GiHamburger,
  GiIceCreamCone,
  GiRiceCooker,
  GiSandwich,
  GiSteak,
} from 'react-icons/gi'

export const fakeFoodData: FoodItemType[] = [
  {
    id: 1,
    name: 'قورمه‌سبزی',
    price: 120000,
    description: 'خورشتی محبوب با ترکیب سبزیجات معطر و گوشت گوساله.',
    image: 'https://placehold.co/400',
  },
  {
    id: 2,
    name: 'زرشک‌پلو با مرغ',
    price: 150000,
    description: 'برنج زعفرانی با مرغ و زرشک خوش‌طعم.',
    image: 'https://placehold.co/400',
  },
  {
    id: 3,
    name: 'چلوکباب سلطانی',
    price: 250000,
    description: 'ترکیب لذیذی از کباب برگ و کباب کوبیده.',
    image: 'https://placehold.co/400',
  },
  {
    id: 4,
    name: 'باقالی‌پلو با گوشت',
    price: 230000,
    description: 'برنج باقالی معطر همراه با گوشت گوسفندی نرم.',
    image: 'https://placehold.co/400',
  },
  {
    id: 5,
    name: 'دیزی سنگی',
    price: 180000,
    description: 'خوراک سنتی با ترکیب گوشت، حبوبات و سیب‌زمینی.',
    image: 'https://placehold.co/400',
  },
  {
    id: 6,
    name: 'آبگوشت',
    price: 140000,
    description: 'غذای اصیل ایرانی با ترکیب گوشت و نخود در آبگوشت خوشمزه.',
    image: 'https://placehold.co/400',
  },
  {
    id: 7,
    name: 'فسنجان',
    price: 200000,
    description: 'خورشت فسنجان با گردو و رب انار و گوشت مرغ یا گوساله.',
    image: 'https://placehold.co/400',
  },
  {
    id: 8,
    name: 'میرزا قاسمی',
    price: 110000,
    description: 'پیش‌غذای محبوب شمالی با بادمجان کبابی و تخم‌مرغ.',
    image: 'https://placehold.co/400',
  },
  {
    id: 9,
    name: 'کوفته تبریزی',
    price: 160000,
    description: 'کوفته‌های بزرگ با گوشت، لپه و تخم‌مرغ در سس گوجه.',
    image: 'https://placehold.co/400',
  },
  {
    id: 10,
    name: 'کباب ترش',
    price: 270000,
    description: 'کبابی شمالی با طعم دلپذیر رب انار و سبزیجات محلی.',
    image: 'https://placehold.co/400',
  },
]

export const fakeCategoryFood: CategoryItemType[] = [
  { id: 1, name: 'خورشت‌ها', icon: GiCook },
  { id: 2, name: 'کباب‌ها', icon: GiSteak },
  { id: 3, name: 'پلوها', icon: GiRiceCooker },
  { id: 5, name: 'خوراک‌ها', icon: GiBowlOfRice },
  { id: 6, name: 'دسرها', icon: GiIceCreamCone },
  { id: 7, name: 'نوشیدنی‌ها', icon: GiGlassShot },
  { id: 8, name: 'پیش‌غذاها', icon: GiSandwich },
  { id: 10, name: 'فست‌فود', icon: GiHamburger },
]
