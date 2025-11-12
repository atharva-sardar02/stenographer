import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export interface DraftContent {
  facts: string;
  liability: string;
  damages: string;
  demand: string;
}

export interface ExportOptions {
  matterTitle?: string;
  clientName?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
}

/**
 * Generates a DOCX document from draft content
 */
export async function generateDocx(
  content: DraftContent,
  options: ExportOptions = {}
): Promise<Buffer> {
  const {
    matterTitle = 'Demand Letter',
    clientName = '',
    includeHeader = true,
    includeFooter = true,
  } = options;

  // Helper to convert HTML to docx paragraphs
  const htmlToParagraphs = (html: string): Paragraph[] => {
    // Simple HTML to text conversion (strip tags)
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (!text) return [];

    // Split by newlines and create paragraphs
    const lines = text.split(/\n+/).filter((line) => line.trim());
    return lines.map(
      (line) =>
        new Paragraph({
          text: line.trim(),
          spacing: { after: 200 },
        })
    );
  };

  const children: Paragraph[] = [];

  // Header
  if (includeHeader) {
    children.push(
      new Paragraph({
        text: matterTitle,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    if (clientName) {
      children.push(
        new Paragraph({
          text: `Client: ${clientName}`,
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
        })
      );
    }

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 400 },
      })
    );
  }

  // Statement of Facts
  children.push(
    new Paragraph({
      text: 'STATEMENT OF FACTS',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );
  children.push(...htmlToParagraphs(content.facts));

  // Liability
  children.push(
    new Paragraph({
      text: 'LIABILITY',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );
  children.push(...htmlToParagraphs(content.liability));

  // Damages
  children.push(
    new Paragraph({
      text: 'DAMAGES',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );
  children.push(...htmlToParagraphs(content.damages));

  // Demand
  children.push(
    new Paragraph({
      text: 'DEMAND',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );
  children.push(...htmlToParagraphs(content.demand));

  // Footer
  if (includeFooter) {
    children.push(
      new Paragraph({
        text: '',
        spacing: { before: 400 },
      })
    );
    children.push(
      new Paragraph({
        text: `Generated on ${new Date().toLocaleDateString()}`,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

