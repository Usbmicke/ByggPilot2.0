'use client';

import React, { useState } from 'react';
import { CalculationItem, CalculationCategory } from '@/app/types/calculation';
import { v4 as uuidv4 } from 'uuid';

interface CalculationSectionProps {
    title: string;
    category: CalculationCategory;
    items: CalculationItem[];
    onUpdate: (updatedItems: CalculationItem[]) => void;
}

// Helper för att få rätt platshållare baserat på kategori
const getPlaceholders = (category: CalculationCategory) => {
    switch (category) {
        case 'Material': 
            return { item: '+ Lägg till material...', unit: 'st' };
        case 'Arbete': 
            return { item: '+ Lägg till arbete...', unit: 'tim' };
        case 'Underentreprenör': 
            return { item: '+ Lägg till UE...', unit: 'pkt' };
        case 'Övrigt': 
            return { item: '+ Lägg till övrigt...', unit: 'st' };
        default: 
            return { item: '+ Lägg till rad...', unit: 'st' };
    }
}


export default function CalculationSection({ title, category, items, onUpdate }: CalculationSectionProps) {
    const placeholders = getPlaceholders(category);
    const [newItem, setNewItem] = useState({ description: '', quantity: 1, unit: '', unitPrice: 0 });

    const handleAddItem = () => {
        if (!newItem.description) return; // Lägg inte till tomma rader
        const itemToAdd: CalculationItem = {
            id: uuidv4(),
            ...newItem,
            unit: newItem.unit || placeholders.unit, // Använd standardenhet om fältet är tomt
            category,
        };
        onUpdate([...items, itemToAdd]);
        setNewItem({ description: '', quantity: 1, unit: '', unitPrice: 0 }); // Återställ
    };

    const handleItemChange = (id: string, field: keyof CalculationItem, value: any) => {
        const updatedItems = items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        onUpdate(updatedItems);
    };

    const handleRemoveItem = (id: string) => {
        const updatedItems = items.filter(item => item.id !== id);
        onUpdate(updatedItems);
    };
    
    // Hantera Enter-tryck för att lägga till en ny rad
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleAddItem();
        }
    };

    const subTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                        <input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="col-span-5 bg-gray-700 p-2 rounded-md text-sm" placeholder="Beskrivning" />
                        <input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-2 bg-gray-700 p-2 rounded-md text-sm" placeholder="Antal" />
                        <input type="text" value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className="col-span-1 bg-gray-700 p-2 rounded-md text-sm" placeholder={placeholders.unit} />
                        <input type="number" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="col-span-2 bg-gray-700 p-2 rounded-md text-sm" placeholder="À-pris" />
                        <div className="col-span-1 text-right text-sm font-mono">{(item.quantity * item.unitPrice).toFixed(2)}</div>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-400">✕</button>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                 {/* Rad för att lägga till ny item */}
                 <div className="grid grid-cols-12 gap-3 items-center">
                    <input type="text" value={newItem.description} onKeyPress={handleKeyPress} onChange={e => setNewItem({...newItem, description: e.target.value})} className="col-span-5 bg-gray-800 p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder={placeholders.item} />
                    <input type="number" value={newItem.quantity} onKeyPress={handleKeyPress} onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})} className="col-span-2 bg-gray-800 p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    <input type="text" value={newItem.unit} onKeyPress={handleKeyPress} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="col-span-1 bg-gray-800 p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder={placeholders.unit} />
                    <input type="number" value={newItem.unitPrice} onKeyPress={handleKeyPress} onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})} className="col-span-2 bg-gray-800 p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    <div className="col-span-1"></div>
                    <button onClick={handleAddItem} className="bg-cyan-600 text-white rounded-md h-full">Lägg till</button>
                </div>
                <div className="flex justify-end items-center mt-4">
                    <span className="text-sm text-gray-400 mr-4">Delsumma {title}:</span>
                    <span className="text-lg font-bold text-white">{subTotal.toFixed(2)} kr</span>
                </div>
            </div>
        </div>
    );
}
