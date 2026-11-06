import { DomainId, SkillItem } from '@/types';

export const SKILLS_DATABASE: SkillItem[] = [
  // Programming Languages
  { id: 'ts', name: 'TypeScript', category: 'Programming Languages', domains: ['software_web', 'mobile_development', 'cloud_devops'] },
  { id: 'py', name: 'Python', category: 'Programming Languages', domains: ['artificial_intelligence', 'machine_learning', 'data_science', 'cs_research', 'fintech_quant', 'bioinformatics_healthtech'] },
  { id: 'cpp', name: 'C++', category: 'Programming Languages', domains: ['competitive_programming', 'game_development', 'networks_systems', 'robotics_iot', 'fintech_quant'] },
  { id: 'rust', name: 'Rust', category: 'Programming Languages', domains: ['networks_systems', 'cybersecurity', 'blockchain_web3', 'cloud_devops'] },
  { id: 'go', name: 'Go (Golang)', category: 'Programming Languages', domains: ['cloud_devops', 'software_web', 'networks_systems'] },
  { id: 'c', name: 'C', category: 'Programming Languages', domains: ['networks_systems', 'robotics_iot', 'electronics_vlsi', 'competitive_programming'] },
  { id: 'sol', name: 'Solidity', category: 'Programming Languages', domains: ['blockchain_web3', 'fintech_quant'] },
  { id: 'dart', name: 'Dart / Flutter', category: 'Programming Languages', domains: ['mobile_development'] },

  // Frontend & Mobile
  { id: 'react', name: 'React & Next.js', category: 'Frontend Development', domains: ['software_web'] },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend Development', domains: ['software_web', 'ui_ux_design'] },
  { id: 'rn', name: 'React Native', category: 'Mobile Development', domains: ['mobile_development', 'software_web'] },
  { id: 'android', name: 'Android (Kotlin/Jetpack)', category: 'Mobile Development', domains: ['mobile_development'] },
  { id: 'ios', name: 'iOS (Swift/SwiftUI)', category: 'Mobile Development', domains: ['mobile_development'] },

  // AI & Data
  { id: 'pytorch', name: 'PyTorch', category: 'AI & Machine Learning', domains: ['machine_learning', 'artificial_intelligence', 'bioinformatics_healthtech'] },
  { id: 'cv', name: 'Computer Vision (OpenCV/YOLO)', category: 'AI & Machine Learning', domains: ['machine_learning', 'robotics_iot'] },
  { id: 'nlp', name: 'NLP & Transformers', category: 'AI & Machine Learning', domains: ['artificial_intelligence', 'machine_learning'] },
  { id: 'rag', name: 'RAG & Vector Databases', category: 'AI & Machine Learning', domains: ['artificial_intelligence', 'software_web'] },
  { id: 'pandas', name: 'Pandas & Data Wrangling', category: 'Data Analytics', domains: ['data_science', 'fintech_quant', 'bioinformatics_healthtech'] },
  { id: 'sql', name: 'Advanced SQL', category: 'Data Analytics', domains: ['data_science', 'software_web', 'fintech_quant'] },

  // Cloud & Security
  { id: 'docker', name: 'Docker & Containers', category: 'Cloud & DevOps', domains: ['cloud_devops', 'software_web'] },
  { id: 'k8s', name: 'Kubernetes', category: 'Cloud & DevOps', domains: ['cloud_devops'] },
  { id: 'terraform', name: 'Terraform (IaC)', category: 'Cloud & DevOps', domains: ['cloud_devops'] },
  { id: 'ethical_hack', name: 'Penetration Testing & Burp Suite', category: 'Cybersecurity', domains: ['cybersecurity'] },
  { id: 'crypto', name: 'Cryptography & Zero-Knowledge', category: 'Cybersecurity', domains: ['cybersecurity', 'blockchain_web3'] },
  { id: 'wireshark', name: 'Wireshark & Packet Analysis', category: 'Networking', domains: ['networks_systems', 'cybersecurity'] },

  // Hardware, Robotics & Games
  { id: 'arduino_esp', name: 'Microcontrollers (Arduino/ESP32)', category: 'Robotics & Hardware', domains: ['robotics_iot'] },
  { id: 'ros', name: 'Robot Operating System (ROS2)', category: 'Robotics & Hardware', domains: ['robotics_iot', 'artificial_intelligence'] },
  { id: 'verilog', name: 'Verilog / VHDL / FPGA', category: 'Hardware & VLSI', domains: ['electronics_vlsi'] },
  { id: 'kicad', name: 'PCB Design (KiCad/Altium)', category: 'Hardware & VLSI', domains: ['electronics_vlsi', 'robotics_iot'] },
  { id: 'unity', name: 'Unity Engine & C#', category: 'Game & XR', domains: ['game_development', 'ar_vr_xr'] },
  { id: 'unreal', name: 'Unreal Engine & C++', category: 'Game & XR', domains: ['game_development', 'ar_vr_xr'] },
  { id: 'threejs', name: 'Three.js & WebXR', category: 'Game & XR', domains: ['ar_vr_xr', 'game_development', 'software_web'] },

  // Design, Business & Research
  { id: 'figma', name: 'Figma & Design Systems', category: 'UI/UX & Product', domains: ['ui_ux_design', 'software_web', 'mobile_development'] },
  { id: 'blender', name: 'Blender 3D Modeling', category: 'Graphic & 3D Design', domains: ['graphic_3d_design', 'game_development', 'ar_vr_xr'] },
  { id: 'lean_startup', name: 'Lean Canvas & Customer Discovery', category: 'Entrepreneurship', domains: ['entrepreneurship'] },
  { id: 'dsa', name: 'Data Structures & Algorithms', category: 'Algorithms', domains: ['competitive_programming', 'software_web', 'cs_research'] },
  { id: 'latex', name: 'LaTeX & Scientific Publishing', category: 'Research', domains: ['cs_research'] },
  { id: 'quant', name: 'Quantitative Backtesting & Risk Models', category: 'FinTech', domains: ['fintech_quant', 'data_science'] },
  { id: 'genomics', name: 'Computational Genomics & Biopython', category: 'HealthTech', domains: ['bioinformatics_healthtech', 'data_science'] },
];

export function getSkillsForDomain(domainId: DomainId): SkillItem[] {
  return SKILLS_DATABASE.filter((s) => s.domains.includes(domainId));
}
