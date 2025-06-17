// src/contexts/ProductContext.tsx
import React, { createContext, useContext, useState } from 'react';

type Product = 'assistant' | 'rollout' | 'analyser';

interface ProductContextType {
    currentProduct: Product;
    setCurrentProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{children: React.ReactNode, initialProduct?: Product}> = ({
                                                                                                     children,
                                                                                                     initialProduct = 'assistant'
                                                                                                 }) => {
    const [currentProduct, setCurrentProduct] = useState<Product>(initialProduct);

    return (
        <ProductContext.Provider value={{ currentProduct, setCurrentProduct }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};