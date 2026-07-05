import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductVariant {
  id: number;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock_quantity: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface CartItem {
  variant_id: number;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, variant, quantity) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.variant_id === variant.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.variant_id === variant.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { variant_id: variant.id, product, variant, quantity }] };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variant_id !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => item.variant_id !== variantId)
            : state.items.map((item) =>
                item.variant_id === variantId ? { ...item, quantity } : item
              ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
