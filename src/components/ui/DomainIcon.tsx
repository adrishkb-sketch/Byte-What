import React from 'react';
import {
  Globe,
  Smartphone,
  Bot,
  Brain,
  BarChart3,
  ShieldAlert,
  Cloud,
  Server,
  Blocks,
  Gamepad2,
  Glasses,
  Cpu,
  Microchip,
  Code2,
  Palette,
  Boxes,
  Rocket,
  GraduationCap,
  Activity,
  TrendingUp,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface DomainIconProps extends LucideProps {
  name: string;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Globe,
  Smartphone,
  Bot,
  Brain,
  BarChart3,
  ShieldAlert,
  Cloud,
  Server,
  Blocks,
  Gamepad2,
  Glasses,
  Cpu,
  Microchip,
  Code2,
  Palette,
  Boxes,
  Rocket,
  GraduationCap,
  Activity,
  TrendingUp,
};

export const DomainIcon: React.FC<DomainIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
};

