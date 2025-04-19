import { detectDocumentStructure } from '@/utils/documentStructureDetector';

export interface MarkupOptions {
  includePositionalData?: boolean;
  enhanceFormatting?: boolean;
  detectLists?: boolean;
  detectTables?: boolean;
  detectHeadings?: boolean;
}

/**
 * Converts OCR text to structured markdown
 */
export const convertToMarkdown = (
  extractedText: string,
  options: MarkupOptions = {}
): { markdown: string; structure: any } => {
  // Default options
  const opts = {
    includePositionalData: true,
    enhanceFormatting: true,
    detectLists: true,
    detectTables: true,
    detectHeadings: true,
    ...options
  };

  // Detect document structure
  const structure = detectDocumentStructure(extractedText);
  
  // Generate markdown based on detected structure
  let markdown = '';
  
  // Process headings
  if (opts.detectHeadings && structure.headings) {
    structure.headings.forEach(heading => {
      const headingLevel = heading.level || 1;
      const prefix = '#'.repeat(headingLevel);
      markdown += `${prefix} ${heading.text}\n\n`;
    });
  }
  
  // Process paragraphs
  if (structure.paragraphs) {
    structure.paragraphs.forEach(para => {
      markdown += `${para.text}\n\n`;
    });
  }
  
  // Process lists
  if (opts.detectLists && structure.lists) {
    structure.lists.forEach(list => {
      list.items.forEach(item => {
        const prefix = list.ordered ? '1. ' : '- ';
        markdown += `${prefix}${item.text}\n`;
      });
      markdown += '\n';
    });
  }
  
  // Process key-value pairs
  if (structure.keyValuePairs) {
    structure.keyValuePairs.forEach(pair => {
      markdown += `**${pair.key}:** ${pair.value}\n`;
    });
    markdown += '\n';
  }
  
  // Process tables
  if (opts.detectTables && structure.tables) {
    structure.tables.forEach(table => {
      if (table.headers && table.headers.length > 0) {
        // Table headers
        markdown += '| ' + table.headers.join(' | ') + ' |\n';
        // Table separator
        markdown += '| ' + table.headers.map(() => '---').join(' | ') + ' |\n';
        
        // Table rows
        table.rows.forEach(row => {
          markdown += '| ' + row.join(' | ') + ' |\n';
        });
        markdown += '\n';
      }
    });
  }
  
  return { 
    markdown: markdown.trim(),
    structure: opts.includePositionalData ? structure : stripPositionalData(structure)
  };
};

/**
 * Removes positional data from the structure object if not needed
 */
function stripPositionalData(structure: any): any {
  const stripped = { ...structure };
  
  // Helper function to remove position from an object
  const stripPosition = (obj: any) => {
    if (!obj) return obj;
    const { position, ...rest } = obj;
    return rest;
  };

  // Strip position data from all structure elements
  if (stripped.headings) {
    stripped.headings = stripped.headings.map(stripPosition);
  }
  
  if (stripped.paragraphs) {
    stripped.paragraphs = stripped.paragraphs.map(stripPosition);
  }
  
  if (stripped.lists) {
    stripped.lists = stripped.lists.map(list => ({
      ...list,
      items: list.items.map(stripPosition)
    }));
  }
  
  if (stripped.keyValuePairs) {
    stripped.keyValuePairs = stripped.keyValuePairs.map(stripPosition);
  }
  
  if (stripped.tables) {
    stripped.tables = stripped.tables.map(stripPosition);
  }
  
  return stripped;
} 