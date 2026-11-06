import { DomainId } from '@/types';

/**
 * Complementarity Matrix (0.0 to 1.0)
 * Represents the synergy and collaboration potential between technology domains.
 * Manually defined based on real-world engineering cross-disciplines.
 */
export const COMPLEMENTARITY_MATRIX: Record<DomainId, Partial<Record<DomainId, number>>> = {
  software_web: {
    cloud_devops: 0.95,
    ui_ux_design: 0.9,
    mobile_development: 0.85,
    cybersecurity: 0.8,
    data_science: 0.75,
    entrepreneurship: 0.85,
    artificial_intelligence: 0.8,
    blockchain_web3: 0.7,
  },
  mobile_development: {
    software_web: 0.85,
    ui_ux_design: 0.95,
    cloud_devops: 0.75,
    robotics_iot: 0.8,
    ar_vr_xr: 0.85,
    entrepreneurship: 0.8,
  },
  artificial_intelligence: {
    machine_learning: 0.95,
    data_science: 0.9,
    robotics_iot: 0.85,
    cs_research: 0.9,
    software_web: 0.8,
    bioinformatics_healthtech: 0.85,
    fintech_quant: 0.8,
  },
  machine_learning: {
    artificial_intelligence: 0.95,
    data_science: 0.95,
    cs_research: 0.9,
    bioinformatics_healthtech: 0.9,
    fintech_quant: 0.85,
    robotics_iot: 0.8,
  },
  data_science: {
    machine_learning: 0.95,
    artificial_intelligence: 0.9,
    fintech_quant: 0.9,
    bioinformatics_healthtech: 0.85,
    software_web: 0.75,
    cs_research: 0.8,
  },
  cybersecurity: {
    networks_systems: 0.95,
    cloud_devops: 0.9,
    blockchain_web3: 0.85,
    software_web: 0.8,
    fintech_quant: 0.8,
  },
  cloud_devops: {
    software_web: 0.95,
    networks_systems: 0.9,
    cybersecurity: 0.9,
    data_science: 0.75,
    mobile_development: 0.7,
  },
  networks_systems: {
    cybersecurity: 0.95,
    cloud_devops: 0.9,
    electronics_vlsi: 0.85,
    robotics_iot: 0.8,
    cs_research: 0.8,
  },
  blockchain_web3: {
    cybersecurity: 0.85,
    fintech_quant: 0.9,
    software_web: 0.7,
    networks_systems: 0.75,
    cs_research: 0.7,
  },
  game_development: {
    ar_vr_xr: 0.95,
    graphic_3d_design: 0.95,
    ui_ux_design: 0.8,
    software_web: 0.65,
    artificial_intelligence: 0.75,
  },
  ar_vr_xr: {
    game_development: 0.95,
    graphic_3d_design: 0.9,
    ui_ux_design: 0.85,
    mobile_development: 0.85,
    robotics_iot: 0.7,
  },
  robotics_iot: {
    electronics_vlsi: 0.95,
    artificial_intelligence: 0.85,
    networks_systems: 0.8,
    machine_learning: 0.8,
    mobile_development: 0.75,
  },
  electronics_vlsi: {
    robotics_iot: 0.95,
    networks_systems: 0.85,
    cs_research: 0.8,
    competitive_programming: 0.65,
  },
  competitive_programming: {
    cs_research: 0.85,
    fintech_quant: 0.8,
    software_web: 0.75,
    machine_learning: 0.7,
  },
  ui_ux_design: {
    graphic_3d_design: 0.9,
    software_web: 0.9,
    mobile_development: 0.95,
    ar_vr_xr: 0.85,
    entrepreneurship: 0.85,
  },
  graphic_3d_design: {
    game_development: 0.95,
    ar_vr_xr: 0.9,
    ui_ux_design: 0.9,
    entrepreneurship: 0.65,
  },
  entrepreneurship: {
    software_web: 0.85,
    ui_ux_design: 0.85,
    fintech_quant: 0.8,
    mobile_development: 0.8,
    artificial_intelligence: 0.75,
  },
  cs_research: {
    artificial_intelligence: 0.9,
    machine_learning: 0.9,
    competitive_programming: 0.85,
    bioinformatics_healthtech: 0.85,
    networks_systems: 0.8,
    electronics_vlsi: 0.8,
  },
  bioinformatics_healthtech: {
    data_science: 0.85,
    machine_learning: 0.9,
    artificial_intelligence: 0.85,
    cs_research: 0.85,
    software_web: 0.7,
  },
  fintech_quant: {
    data_science: 0.9,
    blockchain_web3: 0.9,
    machine_learning: 0.85,
    cybersecurity: 0.8,
    competitive_programming: 0.8,
    entrepreneurship: 0.8,
  },
};

export function getComplementarityScore(domainA: DomainId, domainB: DomainId): number {
  if (domainA === domainB) return 1.0;
  const scoreAB = COMPLEMENTARITY_MATRIX[domainA]?.[domainB];
  const scoreBA = COMPLEMENTARITY_MATRIX[domainB]?.[domainA];
  return scoreAB ?? scoreBA ?? 0.4; // baseline moderate affinity
}

