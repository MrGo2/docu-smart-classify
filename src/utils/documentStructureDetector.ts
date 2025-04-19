interface DocumentItem {
  lineIndex: number;
}

interface Heading extends DocumentItem {
  text: string;
  level: number;
}

interface Paragraph extends DocumentItem {
  text: string;
}

interface ListItem extends DocumentItem {
  text: string;
}

interface List {
  ordered: boolean;
  items: ListItem[];
}

interface KeyValuePair extends DocumentItem {
  key: string;
  value: string;
}

interface Table {
  headers: string[];
  rows: string[][];
  startLineIndex: number;
  endLineIndex: number;
}

interface DocumentStructure {
  headings: Heading[];
  paragraphs: Paragraph[];
  lists: List[];
  keyValuePairs: KeyValuePair[];
  tables: Table[];
}

/**
 * Detects document structure in extracted text
 */
export const detectDocumentStructure = (text: string): DocumentStructure => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  const structure: DocumentStructure = {
    headings: [],
    paragraphs: [],
    lists: [],
    keyValuePairs: [],
    tables: []
  };
  
  // Process lines to detect structure
  let currentParagraph = '';
  let inTable = false;
  let currentTable: Table | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    
    // Detect headings (ALL CAPS or short lines followed by empty line)
    if (
      (line === line.toUpperCase() && line.length > 3 && line.length < 50) ||
      (line.length < 50 && !nextLine && i > 0 && !lines[i-1])
    ) {
      structure.headings.push({
        text: line,
        level: line === line.toUpperCase() ? 1 : 2,
        lineIndex: i
      });
      continue;
    }
    
    // Detect key-value pairs (contains colon with text on both sides)
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0 && colonIndex < line.length - 1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      // Only consider it a key-value if key is reasonably short
      if (key.length < 30 && key.split(' ').length < 6) {
        structure.keyValuePairs.push({ key, value, lineIndex: i });
        continue;
      }
    }
    
    // Detect list items
    if (line.match(/^[\s]*[-•*][\s]+/) || line.match(/^[\s]*\d+\.[\s]+/)) {
      const isOrdered = !!line.match(/^[\s]*\d+\.[\s]+/);
      
      // Find or create the list
      let list = structure.lists.find(l => l.ordered === isOrdered && 
        l.items.length > 0 && 
        Math.abs(l.items[l.items.length - 1].lineIndex - i) <= 2);
      
      if (!list) {
        list = { ordered: isOrdered, items: [] };
        structure.lists.push(list);
      }
      
      // Extract the text without the list marker
      const text = line.replace(/^[\s]*[-•*][\s]+/, '')
                      .replace(/^[\s]*\d+\.[\s]+/, '');
      
      list.items.push({ text, lineIndex: i });
      continue;
    }
    
    // Detect tables (lines with multiple consistent spaces or pipe characters)
    if (line.includes('|') || 
        (line.includes('  ') && line.split(/\s{2,}/).length > 2)) {
      
      if (!inTable) {
        inTable = true;
        currentTable = {
          headers: [],
          rows: [],
          startLineIndex: i,
          endLineIndex: i // Will be updated when table ends
        };
        
        // Try to detect if this line is a header
        const cells = line.includes('|') 
          ? line.split('|').map(cell => cell.trim()).filter(Boolean)
          : line.split(/\s{2,}/).map(cell => cell.trim()).filter(Boolean);
        
        if (cells.length > 1) {
          currentTable.headers = cells;
        }
      } else if (currentTable) {
        // We're already in a table, add this as a row
        const cells = line.includes('|') 
          ? line.split('|').map(cell => cell.trim()).filter(Boolean)
          : line.split(/\s{2,}/).map(cell => cell.trim()).filter(Boolean);
        
        if (cells.length > 1) {
          currentTable.rows.push(cells);
        }
      }
    } else if (inTable && currentTable) {
      // End of table
      inTable = false;
      currentTable.endLineIndex = i - 1;
      structure.tables.push(currentTable);
      currentTable = null;
    } else {
      // Regular paragraph text
      if (currentParagraph && nextLine) {
        currentParagraph += ' ' + line;
      } else {
        if (currentParagraph) {
          structure.paragraphs.push({ 
            text: currentParagraph, 
            lineIndex: i - currentParagraph.split(' ').length
          });
          currentParagraph = '';
        }
        
        if (line.length > 3) {
          currentParagraph = line;
        }
      }
    }
  }
  
  // Add the last paragraph if there is one
  if (currentParagraph) {
    structure.paragraphs.push({ 
      text: currentParagraph, 
      lineIndex: lines.length - currentParagraph.split(' ').length
    });
  }
  
  // Add the last table if we were in one
  if (inTable && currentTable) {
    currentTable.endLineIndex = lines.length - 1;
    structure.tables.push(currentTable);
  }
  
  return structure;
}; 