export type GenerationStep = 'upload' | 'style' | 'processing' | 'preview';

export interface StyleOption {
  id: string;
  title: string;
  description: string;
  image: string;
  complexity: number;
  category: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'chibi',
    title: 'Chibi 3-head',
    description: 'Stylized proportions with high-fidelity textures.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmv8Cx3uIw5tnwWBWDQ8cNgQgNHLbwJeZRMB25S_SeitoZr42QT6Qa0c3dQqTJkXkiJdMuArsvimfQxP3CjegZiZFU8_NiyfzcA7hcPh-fAFvGlcRwguQ5fEkNxkhryNHR4RWV6WHP0pSXKJ5vXJBDieAW7cleLknCf7c-XO_f0kOi9aP_5rxk5P3XVcD02oXhZhFcXXvhgSZFZuXzJjqhIfrsDMs78RAm-l3INBzvs5KXgwvqFn6kf_3tlIaTsRl1VZSYxCAhofHS',
    complexity: 3,
    category: 'Premium Aesthetic'
  },
  {
    id: 'pixel',
    title: 'Pixel Art',
    description: 'Nostalgic grid-based 3D voxels for a retro vibe.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2oahxE67tO7JMdm6pdmb4Fzb4OT8gZX-sm60eJtn4LEpoM7c91mGVjAsqtH02Xz1vugQ_gHU187UANZfbbsMt0uNG6tMipRq-nYSS5p0kpfR6Ul4cm-Ny5SwlweZKRBuHsDnncMEYiqN6ZeAKmINJEGncnrlbeFVKBJVIEUsEDaAlqIAmNUDtmw9SRqeELOU8NMsFmUuywsfZj6U7hOP_w029Qamtg0gVggGH5Bzj43OMxZSO3iLFKJfPYVBWoYU0XchKof-4pLy0',
    complexity: 1,
    category: 'Retro Fusion'
  }
];
