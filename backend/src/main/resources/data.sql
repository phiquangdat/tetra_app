CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS users_content_progress CASCADE;
DROP TABLE IF EXISTS users_unit_progress CASCADE;
DROP TABLE IF EXISTS user_module_progress CASCADE;
DROP TABLE IF EXISTS unit_content CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS training_modules CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS admin_action_logs CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP SEQUENCE IF EXISTS admin_action_log_seq;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
    CHECK (role IN ('ADMIN','LEARNER'))
);

INSERT INTO users (id, name, email, password, role) VALUES
('11111111-0000-0000-0000-000000000001', 'Admin1', 'admin1@example.com', '$2a$10$jG5bNwH2YHStW2jT7je.2u0bzqF8bL1mKWgpi3q4dTYaEZHiqhEXS', 'ADMIN'),
('11111111-0000-0000-0000-000000000002', 'Admin2', 'admin2@example.com', '$2a$10$jG5bNwH2YHStW2jT7je.2u0bzqF8bL1mKWgpi3q4dTYaEZHiqhEXS', 'ADMIN'),
('11111111-0000-0000-0000-000000000003', 'Learner1', 'learner1@example.com', '$2a$10$jG5bNwH2YHStW2jT7je.2u0bzqF8bL1mKWgpi3q4dTYaEZHiqhEXS', 'LEARNER'),
('11111111-0000-0000-0000-000000000004', 'Learner2', 'learner2@example.com', '$2a$10$jG5bNwH2YHStW2jT7je.2u0bzqF8bL1mKWgpi3q4dTYaEZHiqhEXS', 'LEARNER'),
('11111111-0000-0000-0000-000000000005', 'Learner3', 'learner3@example.com', '$2a$10$jG5bNwH2YHStW2jT7je.2u0bzqF8bL1mKWgpi3q4dTYaEZHiqhEXS', 'LEARNER');

CREATE TABLE training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  topic VARCHAR(255),
  points INTEGER,
  coverurl TEXT,
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('draft','published'))
);

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL
);

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL
);

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 0),
  storage_path TEXT NOT NULL
);

INSERT INTO attachments (id, name, mime, size, storage_path) VALUES
('a1111111-1111-1111-1111-111111111111', 'intro_to_ai.pdf', 'application/pdf', 1024, '/uploads/intro_to_ai.pdf'),
('a2222222-2222-2222-2222-222222222222', 'pandas_cheat_sheet.png', 'image/png', 2048, '/uploads/pandas_cheat_sheet.png');

INSERT INTO training_modules (id, title, topic, points, status, coverurl, description)
VALUES
('6acff8d4-9343-44c9-b0e0-63c57d1d911f','Artificial Intelligence','AI',2000,'published', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', 'Master terms and definitions of Artificial Intelligence.'),
('01429d3d-390e-4ce8-9033-a4e98a0fd4f8','Cybersecurity','SECURITY',1800,'published', 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80', 'Protect systems causing fundamental shifts in security paradigms.'),
('11111111-1111-1111-1111-111111111111','Data Science','DATA',1500,'published', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 'Learn to analyze complex data sets using modern tools.'),
('22222222-2222-2222-2222-222222222221','Web Development','WEB',1600,'published', 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80', 'Build responsive and dynamic websites from scratch.');

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL
    REFERENCES training_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL
);

INSERT INTO units (id, module_id, title, description, sort_order) VALUES
('cfae7218-9602-4468-a884-4ebf9f7dc5ae','6acff8d4-9343-44c9-b0e0-63c57d1d911f','Introduction to AI','A comprehensive overview of AI history and core concepts.',10),
('6be64990-63ab-45bb-a8c2-46fe2fde2ce4','01429d3d-390e-4ce8-9033-a4e98a0fd4f8','Cyber Threats','Identify and mitigate common digital security threats.',10),
('11111111-1111-1111-1111-111111111112','11111111-1111-1111-1111-111111111111','Data Analysis Basics','Hands-on introduction to data manipulation with Python.',10),
('22222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222221','HTML & CSS','Foundations of web structure and styling.',10);

CREATE TABLE unit_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL
    REFERENCES units(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  content_type VARCHAR(20) NOT NULL
    CHECK (content_type IN ('article','video','quiz')),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  points INTEGER DEFAULT 0,
  questions_number INTEGER,
  attachment_id UUID REFERENCES attachments(id)
);

INSERT INTO unit_content (id, unit_id, sort_order, content_type, title, content, url, points, attachment_id, questions_number)
VALUES
('1783c1e3-5850-4558-af10-ca731cfda734',
 'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
 10,'video','What is AI?', '',
 'https://www.youtube.com/watch?v=JMUxmLyrhSk',100, 'a1111111-1111-1111-1111-111111111111', NULL),

('171ddada-d917-4090-a711-3e2b6891eef4',
 'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
 20,'quiz','AI Basics Quiz', 'Test your understanding of Artificial Intelligence history and basic concepts. Complete all questions to pass.', NULL,50, NULL, 3),

('11111111-1111-1111-1111-111111111113','11111111-1111-1111-1111-111111111112',10,'video','Introduction to Pandas', '', 'https://www.youtube.com/watch?v=vmEHCJofslg',100, NULL, NULL),
('11111111-1111-1111-1111-111111111114','11111111-1111-1111-1111-111111111112',20,'quiz','Data Science Quiz', 'Assess your knowledge of Data Science tools and libraries like Pandas and Matplotlib.', NULL,50, NULL, 3),
('22222222-2222-2222-2222-222222222223','22222222-2222-2222-2222-222222222222',10,'article','Building your first page', 'The first step in web development is understanding the structure. HTML (HyperText Markup Language) acts as the skeleton of your web pages. Every element, from headers to paragraphs, is defined by tags. <br><br> CSS (Cascading Style Sheets) then steps in as the skin and clothing, determining how your skeleton looks—colors, fonts, and layouts.', NULL,100, 'a2222222-2222-2222-2222-222222222222', NULL),
('22222222-2222-2222-2222-222222222224','22222222-2222-2222-2222-222222222222',20,'quiz','Web Dev Quiz', 'Challenge yourself on HTML structure and CSS styling fundamentals.', NULL,50, NULL, 3),
('33333333-3333-3333-3333-333333333331','6be64990-63ab-45bb-a8c2-46fe2fde2ce4',10,'video','Common Cyber Attacks', '', 'https://www.youtube.com/watch?v=inWWhr5tnEA',100, NULL, NULL),
('33333333-3333-3333-3333-333333333332','6be64990-63ab-45bb-a8c2-46fe2fde2ce4',20,'article','Understanding Phishing', 'Phishing is a cybercrime in which users are contacted by email, telephone or text message by someone posing as a legitimate institution to lure individuals into providing sensitive data such as personally identifiable information, banking and credit card details, and passwords. <br><br> Always verify the sender address!', NULL,100, NULL, NULL),
('33333333-3333-3333-3333-333333333333','6be64990-63ab-45bb-a8c2-46fe2fde2ce4',30,'quiz','Security Basics Quiz', 'Verify your grasp of common cyber threats like Phishing and encryption protocols.', NULL,50, NULL, 3);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL
    REFERENCES unit_content(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('MULTIPLE_CHOICE','TRUE_FALSE')),
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

INSERT INTO questions (id, content_id, type, title, sort_order) VALUES
('c18418ef-f23e-4298-8df2-5e83dee92910',
 '171ddada-d917-4090-a711-3e2b6891eef4',
 'MULTIPLE_CHOICE','What does AI stand for?',10),

('70a96dae-08a4-4366-b6c1-b84cc17bd5e4',
 '171ddada-d917-4090-a711-3e2b6891eef4',
 'TRUE_FALSE','AI can learn from data.',20),

('11111111-1111-1111-1111-111111111115','11111111-1111-1111-1111-111111111114','MULTIPLE_CHOICE','What library is used for data manipulation?',10),
('22222222-2222-2222-2222-222222222225','22222222-2222-2222-2222-222222222224','MULTIPLE_CHOICE','HTML stands for...',10),
('33333333-3333-3333-3333-333333333334','33333333-3333-3333-3333-333333333333','MULTIPLE_CHOICE','What is Phishing?',10),
('33333333-3333-3333-3333-333333333335','33333333-3333-3333-3333-333333333333','TRUE_FALSE','HTTPS encrypts data.',20),

('171ddada-d917-4090-a711-000000000003',
 '171ddada-d917-4090-a711-3e2b6891eef4',
 'MULTIPLE_CHOICE', 'Which of these is a type of Machine Learning?', 30),

('11111111-1111-1111-1111-000000000002', '11111111-1111-1111-1111-111111111114', 'MULTIPLE_CHOICE', 'What is Matplotlib used for?', 20),
('11111111-1111-1111-1111-000000000003', '11111111-1111-1111-1111-111111111114', 'TRUE_FALSE', 'Jupyter Notebooks support live code.', 30),

('22222222-2222-2222-2222-000000000002', '22222222-2222-2222-2222-222222222224', 'MULTIPLE_CHOICE', 'What does CSS stand for?', 20),
('22222222-2222-2222-2222-000000000003', '22222222-2222-2222-2222-222222222224', 'TRUE_FALSE', 'JavaScript is same as Java.', 30),

('33333333-3333-3333-3333-000000000003', '33333333-3333-3333-3333-333333333333', 'MULTIPLE_CHOICE', 'Which password is strongest?', 30);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL
    REFERENCES questions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  sort_order INTEGER NOT NULL
);

INSERT INTO answers (question_id, title, is_correct, sort_order) VALUES
('c18418ef-f23e-4298-8df2-5e83dee92910','Artificial Intelligence',TRUE,10),
('c18418ef-f23e-4298-8df2-5e83dee92910','Automated Interaction',FALSE,20),

('70a96dae-08a4-4366-b6c1-b84cc17bd5e4','True',TRUE,10),
('70a96dae-08a4-4366-b6c1-b84cc17bd5e4','False',FALSE,20),

('11111111-1111-1111-1111-111111111115','Pandas',TRUE,10),
('11111111-1111-1111-1111-111111111115','React',FALSE,20),

('22222222-2222-2222-2222-222222222225','HyperText Markup Language',TRUE,10),
('22222222-2222-2222-2222-222222222225','HighText Machine Language',FALSE,20),

('33333333-3333-3333-3333-333333333334','Email scam attempting to steal sensitive information',TRUE,10),
('33333333-3333-3333-3333-333333333334','A sport involving catching fish',FALSE,20),

('33333333-3333-3333-3333-333333333335','True',TRUE,10),
('33333333-3333-3333-3333-333333333335','False',FALSE,20),

('171ddada-d917-4090-a711-000000000003', 'Supervised Learning', TRUE, 10),
('171ddada-d917-4090-a711-000000000003', 'Magic Learning', FALSE, 20),

('11111111-1111-1111-1111-000000000002', 'Data Visualization', TRUE, 10),
('11111111-1111-1111-1111-000000000002', 'Database Management', FALSE, 20),

('11111111-1111-1111-1111-000000000003', 'True', TRUE, 10),
('11111111-1111-1111-1111-000000000003', 'False', FALSE, 20),

('22222222-2222-2222-2222-000000000002', 'Cascading Style Sheets', TRUE, 10),
('22222222-2222-2222-2222-000000000002', 'Computer Style Sheets', FALSE, 20),

('22222222-2222-2222-2222-000000000003', 'True', FALSE, 10),
('22222222-2222-2222-2222-000000000003', 'False', TRUE, 20),

('33333333-3333-3333-3333-000000000003', 'password123', FALSE, 10),
('33333333-3333-3333-3333-000000000003', 'Th!sIsA$trongP@ssw0rd', TRUE, 20);

CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL
    REFERENCES training_modules(id) ON DELETE CASCADE,
  last_visited_unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  last_visited_content_id UUID REFERENCES unit_content(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('IN_PROGRESS','COMPLETED')),
  earned_points INTEGER DEFAULT 0,
  UNIQUE (user_id, module_id)
);

CREATE TABLE users_unit_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL
    REFERENCES training_modules(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL
    REFERENCES units(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  UNIQUE (user_id, unit_id)
);

CREATE TABLE users_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL
    REFERENCES units(id) ON DELETE CASCADE,
  unit_content_id UUID NOT NULL
    REFERENCES unit_content(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  points INTEGER DEFAULT 0,
  UNIQUE (user_id, unit_content_id)
);

INSERT INTO user_module_progress
(user_id, module_id, status, earned_points, last_visited_unit_id, last_visited_content_id)
VALUES
(
  (SELECT id FROM users WHERE email = 'learner1@example.com'),
  '6acff8d4-9343-44c9-b0e0-63c57d1d911f',
  'IN_PROGRESS',
  150,
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae', '1783c1e3-5850-4558-af10-ca731cfda734'
),
(
  (SELECT id FROM users WHERE email = 'learner1@example.com'),
  '01429d3d-390e-4ce8-9033-a4e98a0fd4f8',
  'IN_PROGRESS',
  0,
  '6be64990-63ab-45bb-a8c2-46fe2fde2ce4', '33333333-3333-3333-3333-333333333331'
),
(
  (SELECT id FROM users WHERE email = 'learner2@example.com'),
  '6acff8d4-9343-44c9-b0e0-63c57d1d911f',
  'IN_PROGRESS',
  100,
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae', '1783c1e3-5850-4558-af10-ca731cfda734'
),
(
  (SELECT id FROM users WHERE email = 'learner2@example.com'),
  '01429d3d-390e-4ce8-9033-a4e98a0fd4f8',
  'IN_PROGRESS',
  0,
  '6be64990-63ab-45bb-a8c2-46fe2fde2ce4', '33333333-3333-3333-3333-333333333331'
),
(
  (SELECT id FROM users WHERE email = 'learner3@example.com'),
  '6acff8d4-9343-44c9-b0e0-63c57d1d911f',
  'COMPLETED',
  150,
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae', '1783c1e3-5850-4558-af10-ca731cfda734'
),
(
  (SELECT id FROM users WHERE email = 'learner3@example.com'),
  '01429d3d-390e-4ce8-9033-a4e98a0fd4f8',
  'IN_PROGRESS',
  0,
  '6be64990-63ab-45bb-a8c2-46fe2fde2ce4', '33333333-3333-3333-3333-333333333331'
);

INSERT INTO users_unit_progress
(user_id, unit_id, module_id, status)
VALUES
(
  (SELECT id FROM users WHERE email = 'learner1@example.com'),
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  '6acff8d4-9343-44c9-b0e0-63c57d1d911f',
  'IN_PROGRESS'
),
(
  (SELECT id FROM users WHERE email = 'learner1@example.com'),
  '6be64990-63ab-45bb-a8c2-46fe2fde2ce4',
  '01429d3d-390e-4ce8-9033-a4e98a0fd4f8',
  'NOT_STARTED'
),
(
  (SELECT id FROM users WHERE email = 'learner2@example.com'),
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  '6acff8d4-9343-44c9-b0e0-63c57d1d911f',
  'IN_PROGRESS'
),
(
  (SELECT id FROM users WHERE email = 'learner3@example.com'),
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  '6acff8d4-9343-44c9-b0e0-63c57d1d911f',
  'COMPLETED'
);

INSERT INTO users_content_progress
(user_id, unit_content_id, unit_id, status, points)
VALUES
(
  (SELECT id FROM users WHERE email = 'learner1@example.com'),
  '1783c1e3-5850-4558-af10-ca731cfda734',
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  'COMPLETED',
  100
),
(
  (SELECT id FROM users WHERE email = 'learner1@example.com'),
  '171ddada-d917-4090-a711-3e2b6891eef4',
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  'IN_PROGRESS',
  50
),
(
  (SELECT id FROM users WHERE email = 'learner2@example.com'),
  '1783c1e3-5850-4558-af10-ca731cfda734',
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  'COMPLETED',
  100
),
(
  (SELECT id FROM users WHERE email = 'learner2@example.com'),
  '171ddada-d917-4090-a711-3e2b6891eef4',
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  'NOT_STARTED',
  0
),
(
  (SELECT id FROM users WHERE email = 'learner3@example.com'),
  '1783c1e3-5850-4558-af10-ca731cfda734',
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  'COMPLETED',
  100
),
(
  (SELECT id FROM users WHERE email = 'learner3@example.com'),
  '171ddada-d917-4090-a711-3e2b6891eef4',
  'cfae7218-9602-4468-a884-4ebf9f7dc5ae',
  'COMPLETED',
  50
);

-- =========================================================
-- LOGGING
-- =========================================================
CREATE TABLE subjects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  unit_content_id UUID,
  unit_id UUID,
  module_id UUID
);

CREATE SEQUENCE admin_action_log_seq START 1;

CREATE TABLE admin_action_logs (
  id BIGINT PRIMARY KEY DEFAULT nextval('admin_action_log_seq'),
  admin_id UUID,
  action_type VARCHAR(255),
  subject_type VARCHAR(255),
  timestamp TIMESTAMP,
  subject_id BIGINT REFERENCES subjects(id)
);

INSERT INTO subjects (user_id, module_id) VALUES
((SELECT id FROM users WHERE email='admin1@example.com'), '6acff8d4-9343-44c9-b0e0-63c57d1d911f'),
((SELECT id FROM users WHERE email='admin1@example.com'), '01429d3d-390e-4ce8-9033-a4e98a0fd4f8');

INSERT INTO admin_action_logs (admin_id, action_type, subject_type, timestamp, subject_id) VALUES
(
  (SELECT id FROM users WHERE email='admin1@example.com'),
  'create',
  'training_module',
  NOW(),
  1
),
(
  (SELECT id FROM users WHERE email='admin1@example.com'),
  'create',
  'training_module',
  NOW(),
  2
);
