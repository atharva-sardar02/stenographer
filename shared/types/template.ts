export interface TemplateSection {
  title: string;
  prompt: string;
  content: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date';
  required: boolean;
  defaultValue: string | null;
}

export interface Template {
  templateId: string;
  name: string;
  description: string;
  sections: {
    facts: TemplateSection;
    liability: TemplateSection;
    damages: TemplateSection;
    demand: TemplateSection;
  };
  variables: TemplateVariable[];
  createdBy: string; // userId
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
}

