import { z } from 'zod';

export const VALID_DOMAINS = [
  'software_web',
  'mobile_development',
  'artificial_intelligence',
  'machine_learning',
  'data_science',
  'cybersecurity',
  'cloud_devops',
  'networks_systems',
  'blockchain_web3',
  'game_development',
  'ar_vr_xr',
  'robotics_iot',
  'electronics_vlsi',
  'competitive_programming',
  'ui_ux_design',
  'graphic_3d_design',
  'entrepreneurship',
  'cs_research',
  'bioinformatics_healthtech',
  'fintech_quant',
] as const;

export const DomainIdEnum = z.enum(VALID_DOMAINS);

export const AiInterpretationSchema = z.object({
  identifiedDomains: z.array(DomainIdEnum).min(1).max(4),
  supportingPhrases: z.array(z.string()).default([]),
  explanation: z.string().min(10),
  confidence: z.number().min(0).max(100),
  suggestedRelatedDomains: z.array(DomainIdEnum).default([]),
});

export const SuggestedProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  domains: z.array(DomainIdEnum).min(1),
  technologies: z.array(z.string()).default([]),
});

export const AiExplanationSchema = z.object({
  writtenExplanation: z.string().min(20),
  crossDomainInsights: z.array(z.string()).default([]),
  suggestedProjects: z.array(SuggestedProjectSchema).min(1).max(4),
});

export type AiInterpretation = z.infer<typeof AiInterpretationSchema>;
export type AiExplanation = z.infer<typeof AiExplanationSchema>;
