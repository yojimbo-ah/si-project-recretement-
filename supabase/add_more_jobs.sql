-- =============================================
-- TALENT-DZ : Insertion de nouvelles offres d'emploi
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- =============================================

INSERT INTO job_offers (title, company, location, type, salary, description) VALUES

-- Tech & Dev
('Senior React Developer',       'Yassir',              '16-Alger',              'Hybrid',    '180k - 250k DA', 'Build and maintain our rider and driver web apps using React and TypeScript.'),
('Mobile Developer (React Native)','Temtem',            '31-Oran',               'Remote',    '150k - 200k DA', 'Develop cross-platform mobile apps for our delivery platform.'),
('DevOps Engineer',              'Sonatrach',           '30-Ouargla',            'On-site',   '180k - 240k DA', 'Manage CI/CD pipelines and cloud infrastructure on Azure/AWS.'),
('Cybersecurity Analyst',        'Algérie Télécom',     '16-Alger',              'On-site',   '160k - 220k DA', 'Monitor threats, manage SIEM tools and ensure data protection compliance.'),
('AI/ML Engineer',               'NCA Rouïba',          '16-Alger',              'Hybrid',    '200k - 280k DA', 'Design predictive models for production optimization.'),
('Full Stack Developer (Node/Vue)','Startup DZ',        'Remote',                'Remote',    '120k - 170k DA', 'Build scalable SaaS features for our HR platform.'),

-- Business & Finance
('Financial Analyst',            'Société Générale',    '16-Alger',              'Hybrid',    '110k - 160k DA', 'Analyze market trends and produce weekly financial reports.'),
('Project Manager (PMP)',        'Condor Electronics',  '34-Bordj Bou Arreridj', 'On-site',   '130k - 180k DA', 'Coordinate cross-functional teams for new product launches.'),
('Sales Executive',              'Ooredoo',             '31-Oran',               'Hybrid',    '80k - 120k DA',  'Drive B2B sales growth in the western region.'),
('Marketing Manager',            'Djezzy',              '16-Alger',              'On-site',   '140k - 190k DA', 'Lead integrated marketing campaigns across digital and offline channels.'),
('Accounting Manager',           'BNP Paribas El Djazaïr','16-Alger',           'On-site',   '120k - 170k DA', 'Oversee month-end close, tax filing and financial controls.'),

-- Creative & Content
('UI/UX Designer',               'Yassir',              '16-Alger',              'Hybrid',    '100k - 150k DA', 'Design intuitive interfaces for our consumer-facing products.'),
('Digital Marketing Specialist', 'Mobilis',             '16-Alger',              'On-site',   '90k - 130k DA',  'Manage SEO, paid ads and social media to grow our subscriber base.'),
('Content Creator (Video)',      'Talent-DZ',           'Remote',                'Remote',    '60k - 100k DA',  'Produce educational and promotional video content for our platform.'),
('Graphic Designer',             'Air Algérie',         '16-Alger',              'On-site',   '70k - 110k DA',  'Create visual assets for campaigns, signage and digital communications.'),

-- Engineering & Industry
('Mechanical Engineer',          'Cevital',             '06-Béjaïa',             'On-site',   '120k - 170k DA', 'Maintain production equipment and lead preventive maintenance plans.'),
('Electrical Engineer',          'Sonelgaz',            '25-Constantine',        'On-site',   '130k - 180k DA', 'Design and supervise electrical installations for HV infrastructure.'),
('Civil Engineer',               'COSIDER',             '16-Alger',              'On-site',   '140k - 200k DA', 'Manage construction projects including roads, bridges and buildings.'),

-- HR & Admin  
('HR Business Partner',          'Sonatrach',           '16-Alger',              'On-site',   '120k - 160k DA', 'Partner with business units to drive talent acquisition and development.'),
('Executive Assistant',          'Groupe Hasnaoui',     '19-Sétif',              'On-site',   '70k - 100k DA',  'Support C-level executives with agenda, travel and communications.');
