import { convertToMarkdown } from '../markupService';

describe('markupService', () => {
  describe('convertToMarkdown', () => {
    it('should convert headings correctly', () => {
      const input = `# Main Title
This is a paragraph

## Subtitle
Another paragraph`;

      const { markdown } = convertToMarkdown(input);
      expect(markdown).toContain('# Main Title');
      expect(markdown).toContain('## Subtitle');
    });

    it('should handle lists correctly', () => {
      const input = `Shopping List:
- Apples
- Bananas
- Oranges

Tasks:
1. First task
2. Second task
3. Third task`;

      const { markdown } = convertToMarkdown(input);
      expect(markdown).toContain('- Apples');
      expect(markdown).toContain('1. First task');
    });

    it('should process tables correctly', () => {
      const input = `| Name | Age | City |
| John | 30 | New York |
| Jane | 25 | London |`;

      const { markdown } = convertToMarkdown(input);
      expect(markdown).toContain('| Name | Age | City |');
      expect(markdown).toContain('| --- | --- | --- |');
      expect(markdown).toContain('| John | 30 | New York |');
    });

    it('should handle key-value pairs', () => {
      const input = `Name: John Smith
Age: 30
Location: New York`;

      const { markdown } = convertToMarkdown(input);
      expect(markdown).toContain('**Name:** John Smith');
      expect(markdown).toContain('**Age:** 30');
    });

    it('should respect markup options', () => {
      const input = `# Title
| Name | Age |
| John | 30 |

- Item 1
- Item 2`;

      const { markdown } = convertToMarkdown(input, {
        detectTables: false,
        detectLists: false
      });

      expect(markdown).toContain('# Title');
      expect(markdown).not.toContain('| Name | Age |');
      expect(markdown).not.toContain('- Item');
    });

    it('should handle positional data correctly', () => {
      const input = 'Simple paragraph';
      
      const { structure: withPosition } = convertToMarkdown(input, {
        includePositionalData: true
      });
      
      const { structure: withoutPosition } = convertToMarkdown(input, {
        includePositionalData: false
      });

      expect(withPosition.paragraphs[0]).toHaveProperty('position');
      expect(withoutPosition.paragraphs[0]).not.toHaveProperty('position');
    });
  });
}); 