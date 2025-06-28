import { ShoppingItem, ParsedItems, ListCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class ParserService {
  private static readonly UNITS = [
    'kg', 'g', 'l', 'ml', 'un', 'cx', 'pct', 'dz', 'lt', 'pc', 'und', 'unidade', 'litro', 'grama', 'quilo'
  ];

  private static readonly CATEGORY_KEYWORDS = {
    'Mercado': ['arroz', 'feijão', 'açúcar', 'leite', 'pão', 'carne', 'frango', 'peixe', 'verdura', 'fruta', 'legume'],
    'Farmácia': ['remédio', 'medicamento', 'vitamina', 'pomada', 'xarope', 'comprimido', 'dipirona', 'paracetamol'],
    'Papelaria': ['caneta', 'lápis', 'papel', 'caderno', 'borracha', 'régua', 'cola', 'tesoura'],
    'Pet Shop': ['ração', 'petisco', 'brinquedo', 'coleira', 'shampoo pet', 'areia', 'gato', 'cachorro']
  };

  static parseVoiceInput(text: string, defaultCategory: ListCategory = 'Mercado'): ParsedItems {
    // Clean and normalize the text
    const cleanText = text.toLowerCase().trim();
    
    // Split by common separators
    const separators = /[,;]|\s+e\s+|\s+mais\s+/g;
    const rawItems = cleanText.split(separators);

    const items: Omit<ShoppingItem, 'id' | 'createdAt' | 'checked'>[] = [];

    for (const rawItem of rawItems) {
      const trimmedItem = rawItem.trim();
      if (!trimmedItem) continue;

      const parsedItem = this.parseIndividualItem(trimmedItem, defaultCategory);
      if (parsedItem) {
        items.push(parsedItem);
      }
    }

    return { items };
  }

  private static parseIndividualItem(
    itemText: string, 
    defaultCategory: ListCategory
  ): Omit<ShoppingItem, 'id' | 'createdAt' | 'checked'> | null {
    if (!itemText.trim()) return null;

    // Regex aprimorada: captura quantidade (ponto ou vírgula), unidade (opcional), nome do item
    // Ex: '2 sabonetes', '0,5 kg de queijo', '3 latas de milho', 'arroz'
    const match = itemText.match(/^(\d+(?:[\.,]\d+)?)(?:\s*([a-zA-Zçãõéêíóúâôûáéíóúàèìòùü]+))?\s*(.*)$/);
    let name = itemText;
    let unit = 'un';
    let price: number | undefined;
    let quantity = 1;

    if (match) {
      const [, quantityStr, possibleUnit, rest] = match;
      const numericQuantity = parseFloat(quantityStr.replace(',', '.'));
      if (!isNaN(numericQuantity)) {
        quantity = numericQuantity;
      }
      if (possibleUnit && this.UNITS.includes(possibleUnit.toLowerCase())) {
        unit = possibleUnit.toLowerCase();
        name = rest.trim();
      } else {
        name = [possibleUnit, rest].filter(Boolean).join(' ').trim();
      }
    } else {
      // fallback: tenta capturar preço como antes
      const quantityMatch = itemText.match(/(\d+(?:[\.,]\d+)?)(?:\s*([a-zA-Z]+))?/);
      if (quantityMatch) {
        const [fullMatch, quantityStr, possibleUnit] = quantityMatch;
        const numericQuantity = parseFloat(quantityStr.replace(',', '.'));
        if (!isNaN(numericQuantity)) {
          quantity = numericQuantity;
        }
        if (possibleUnit && this.UNITS.includes(possibleUnit.toLowerCase())) {
          unit = possibleUnit.toLowerCase();
          name = itemText.replace(fullMatch, '').trim();
        } else if (numericQuantity > 0 && numericQuantity >= 0.1 && numericQuantity <= 1000) {
          price = numericQuantity;
          name = itemText.replace(fullMatch, '').trim();
          quantity = 1;
        }
      }
    }

    name = name.replace(/^\s*-\s*/, '').trim();
    if (!name) return null;

    const category = this.determineCategory(name, defaultCategory);

    return {
      name,
      unit,
      quantity,
      price,
      category,
    };
  }

  private static determineCategory(itemName: string, defaultCategory: ListCategory): ListCategory {
    const lowerName = itemName.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category as ListCategory;
      }
    }
    
    return defaultCategory;
  }

  static formatItemForDisplay(item: ShoppingItem): string {
    let display = item.name;
    
    if (item.unit !== 'un') {
      display += ` (${item.unit})`;
    }
    
    if (item.price) {
      display += ` - R$ ${item.price.toFixed(2)}`;
    }
    
    return display;
  }

  static calculateTotal(items: ShoppingItem[]): number {
    return items.reduce((total, item) => {
      const price = item.scannedPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  }
}