-- BYTE WHAT Seed Data
-- Inserts all 20 Predefined Domains and Initial Project / Profile Seed Data

INSERT INTO domains (id, name, description, category, icon, related_domains) VALUES
('software_web', 'Software Engineering & Web Development', 'Architecting robust, scalable web applications and enterprise software systems.', 'Core Software & Systems', 'Globe', ARRAY['cloud_devops', 'mobile_development', 'cybersecurity', 'ui_ux_design', 'entrepreneurship']),
('mobile_development', 'Mobile App Development', 'Engineering native and cross-platform apps for smartphones, tablets, and wearables.', 'Core Software & Systems', 'Smartphone', ARRAY['software_web', 'ui_ux_design', 'robotics_iot', 'cloud_devops']),
('artificial_intelligence', 'Artificial Intelligence', 'Developing autonomous agents, reasoning engines, and cognitive AI systems.', 'Data & Intelligence', 'Bot', ARRAY['machine_learning', 'data_science', 'robotics_iot', 'cs_research', 'fintech_quant']),
('machine_learning', 'Machine Learning & Deep Learning', 'Training neural networks, predictive models, and computer vision systems.', 'Data & Intelligence', 'Brain', ARRAY['artificial_intelligence', 'data_science', 'bioinformatics_healthtech', 'robotics_iot', 'cs_research']),
('data_science', 'Data Science & Analytics', 'Extracting actionable insights, building dashboards, and statistical modelling.', 'Data & Intelligence', 'BarChart3', ARRAY['machine_learning', 'fintech_quant', 'bioinformatics_healthtech', 'software_web']),
('cybersecurity', 'Cybersecurity & Ethical Hacking', 'Protecting systems, penetration testing, cryptography, and digital forensics.', 'Core Software & Systems', 'ShieldAlert', ARRAY['networks_systems', 'cloud_devops', 'blockchain_web3', 'software_web']),
('cloud_devops', 'Cloud Computing & DevOps', 'Automating deployment pipelines, managing infrastructure as code, and scaling cloud platforms.', 'Core Software & Systems', 'Cloud', ARRAY['software_web', 'networks_systems', 'cybersecurity']),
('networks_systems', 'Computer Networks & Systems', 'Deep diving into operating system internals, protocols, and low-level performance.', 'Core Software & Systems', 'Server', ARRAY['cybersecurity', 'cloud_devops', 'electronics_vlsi', 'software_web']),
('blockchain_web3', 'Blockchain & Web3', 'Decentralized consensus, smart contract development, and trustless protocols.', 'Core Software & Systems', 'Blocks', ARRAY['cybersecurity', 'fintech_quant', 'software_web', 'cs_research']),
('game_development', 'Game Development', 'Crafting interactive gameplay, physics simulations, and immersive game engines.', 'Design & Creative', 'Gamepad2', ARRAY['ar_vr_xr', 'graphic_3d_design', 'ui_ux_design', 'software_web']),
('ar_vr_xr', 'AR, VR & Extended Reality', 'Immersive spatial computing, virtual environments, and augmented reality.', 'Design & Creative', 'Glasses', ARRAY['game_development', 'graphic_3d_design', 'ui_ux_design', 'software_web']),
('robotics_iot', 'Robotics, IoT & Embedded Systems', 'Bridging software and hardware through microcontrollers, sensors, actuators, and robotics.', 'Hardware & Physical Computing', 'Cpu', ARRAY['electronics_vlsi', 'artificial_intelligence', 'machine_learning', 'networks_systems']),
('electronics_vlsi', 'Electronics, VLSI & Hardware', 'Digital logic design, semiconductor technology, microarchitectures, and chip design.', 'Hardware & Physical Computing', 'Microchip', ARRAY['robotics_iot', 'networks_systems', 'cs_research']),
('competitive_programming', 'Competitive Programming & Algorithms', 'Mastering algorithmic problem solving, computational complexity, and contest programming.', 'Core Software & Systems', 'Code2', ARRAY['software_web', 'cs_research', 'fintech_quant', 'machine_learning']),
('ui_ux_design', 'UI/UX & Product Design', 'User-centered design, prototyping, usability testing, and visual design systems.', 'Design & Creative', 'Palette', ARRAY['graphic_3d_design', 'software_web', 'mobile_development', 'entrepreneurship']),
('graphic_3d_design', 'Graphic Design, Animation & 3D', 'Visual identity, 3D modelling, vector illustration, and motion graphics.', 'Design & Creative', 'Boxes', ARRAY['ui_ux_design', 'game_development', 'ar_vr_xr', 'entrepreneurship']),
('entrepreneurship', 'Entrepreneurship & Product Innovation', 'Transforming technical innovations into viable businesses, validation, and product management.', 'Applied & Interdisciplinary', 'Rocket', ARRAY['software_web', 'ui_ux_design', 'fintech_quant', 'artificial_intelligence']),
('cs_research', 'Computer Science Research', 'Conducting novel computational investigations, theoretical analysis, and academic publishing.', 'Applied & Interdisciplinary', 'GraduationCap', ARRAY['artificial_intelligence', 'machine_learning', 'competitive_programming', 'bioinformatics_healthtech']),
('bioinformatics_healthtech', 'Bioinformatics & HealthTech', 'Applying algorithms to genomic sequences, medical imaging, and healthcare technology.', 'Applied & Interdisciplinary', 'Activity', ARRAY['data_science', 'machine_learning', 'cs_research', 'artificial_intelligence']),
('fintech_quant', 'FinTech & Quantitative Computing', 'Algorithmic trading, financial risk modeling, fraud detection, and payment architectures.', 'Applied & Interdisciplinary', 'TrendingUp', ARRAY['data_science', 'blockchain_web3', 'machine_learning', 'competitive_programming'])
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Public Projects
INSERT INTO projects (id, title, description, creator_pseudonym, status, skill_requirements, difficulty, team_requirements) VALUES
('b3c8fa10-2101-44ab-89cd-8812c3e12001', 'Autonomous Campus Solar Rover', 'Building an ESP32 and ROS2 based miniature rover for automated soil and ambient temperature telemetry around GCECT grounds.', 'CeramicCoder', 'Open', ARRAY['C/C++', 'ROS2', 'ESP32', 'Sensors'], 'Intermediate', 'Looking for 1 hardware enthusiast and 1 ROS programmer.'),
('b3c8fa10-2101-44ab-89cd-8812c3e12002', 'GCECT Virtual 3D Ceramic Museum (WebXR)', 'An interactive browser-based 3D gallery rendering scanned traditional and modern ceramic glazes with realistic PBR shaders.', 'PixelAlchemist', 'Open', ARRAY['Three.js', 'Blender', 'Next.js', 'WebXR'], 'Intermediate', 'Need someone familiar with GLSL shaders and responsive web design.'),
('b3c8fa10-2101-44ab-89cd-8812c3e12003', 'Ceramic Fracture Stress Predictor', 'Predicting fracture points of ceramic tiles under thermal shocks using physics-guided neural networks.', 'QuantTensor', 'In Progress', ARRAY['PyTorch', 'NumPy', 'Pandas'], 'Advanced', 'Collaborating on dataset preparation and model validation.')
ON CONFLICT (id) DO NOTHING;

-- Map Sample Projects to Domains
INSERT INTO project_domains (project_id, domain_id) VALUES
('b3c8fa10-2101-44ab-89cd-8812c3e12001', 'robotics_iot'),
('b3c8fa10-2101-44ab-89cd-8812c3e12001', 'electronics_vlsi'),
('b3c8fa10-2101-44ab-89cd-8812c3e12002', 'ar_vr_xr'),
('b3c8fa10-2101-44ab-89cd-8812c3e12002', 'graphic_3d_design'),
('b3c8fa10-2101-44ab-89cd-8812c3e12003', 'machine_learning'),
('b3c8fa10-2101-44ab-89cd-8812c3e12003', 'cs_research')
ON CONFLICT (project_id, domain_id) DO NOTHING;

