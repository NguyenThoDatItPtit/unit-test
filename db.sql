-- Merged & ordered schema (ensure dependencies created before dependent tables)
-- Date: 2025-12-20
-- Notes:
--  - This script assumes pgvector is available on the server.
--  - Enums and extension are created first.
--  - Tables are ordered so referenced tables/types exist before being used in foreign keys.
--  - Indexes created at the end.

-- 1) Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) ENUM types (create only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flashcard_status') THEN
    CREATE TYPE flashcard_status AS ENUM ('pending','done','miss');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roadmap_status') THEN
    CREATE TYPE roadmap_status AS ENUM ('pending','done','skip','in_process');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_status') THEN
    CREATE TYPE study_status AS ENUM ('pending','done','miss');
  END IF;
END$$;

-- 3) Roles
CREATE TABLE IF NOT EXISTS role (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO role (role_id, role_name)
VALUES (1, 'USER'), (2, 'ADMIN')
ON CONFLICT (role_id) DO NOTHING;

-- 4) Users (depends on role)
CREATE TABLE IF NOT EXISTS "user" (
  user_id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  password_hash VARCHAR(200),
  birthday DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  role_id INT DEFAULT 1 REFERENCES role(role_id) ON DELETE SET NULL,
  available BOOLEAN DEFAULT true
);

-- 5) User update / history (depends on "user")
CREATE TABLE IF NOT EXISTS user_update (
  user_update_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
  user_name VARCHAR(100),
  email VARCHAR(200),
  password_hash VARCHAR(200),
  birthday DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by INT REFERENCES "user"(user_id) ON DELETE SET NULL
);

-- 6) Subjects
CREATE TABLE IF NOT EXISTS subject (
  subject_id SERIAL PRIMARY KEY,
  subject_name VARCHAR(100) NOT NULL,
  subject_type INT DEFAULT 1,
  available BOOLEAN DEFAULT true
);

-- 7) Topics (depends on subject)
CREATE TABLE IF NOT EXISTS topic (
  topic_id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  subject_id INT REFERENCES subject(subject_id) ON DELETE SET NULL
);

-- 8) Roadmap steps (depends on topic)
CREATE TABLE IF NOT EXISTS roadmap_step (
  roadmap_step_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL
);

-- 9) Documents (depends on topic)
CREATE TABLE IF NOT EXISTS document (
  document_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  link VARCHAR(500),
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL,
  available BOOLEAN DEFAULT true
);

-- 10) Document history (depends on document and user)
CREATE TABLE IF NOT EXISTS document_history (
  document_history_id SERIAL PRIMARY KEY,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
  document_id INT REFERENCES document(document_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11) Chunk (depends on document)
CREATE TABLE IF NOT EXISTS chunk (
  chunk_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT,
  link VARCHAR(250),
  embedding vector(384),
  document_id INT REFERENCES document(document_id) ON DELETE CASCADE
);

-- 12) Roadmap step <-> document mapping (depends on roadmap_step and document)
-- CREATE TABLE IF NOT EXISTS roadmap_step_document (
--   roadmap_step_id INT NOT NULL,
--   document_id INT NOT NULL,
--   PRIMARY KEY (roadmap_step_id, document_id),
--   FOREIGN KEY (roadmap_step_id) REFERENCES roadmap_step(roadmap_step_id) ON DELETE CASCADE,
--   FOREIGN KEY (document_id) REFERENCES document(document_id) ON DELETE CASCADE
-- );

-- 13) User roadmap step (depends on roadmap_step and user)
-- CREATE TABLE IF NOT EXISTS user_roadmap_step (
--   user_roadmap_step_id SERIAL PRIMARY KEY,
--   status roadmap_status DEFAULT 'pending',
--   roadmap_step_id INT REFERENCES roadmap_step(roadmap_step_id) ON DELETE CASCADE,
--   user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE
-- );

-- 14) Flashcard deck (depends on user)
CREATE TABLE IF NOT EXISTS flashcard_deck (
  flashcard_deck_id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed TIMESTAMPTZ,
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- 15) Flashcard (depends on flashcard_deck)
CREATE TABLE IF NOT EXISTS flashcard (
  flashcard_id SERIAL PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT,
  example TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  status flashcard_status DEFAULT 'pending',
  flashcard_deck_id INT REFERENCES flashcard_deck(flashcard_deck_id) ON DELETE CASCADE
);

-- 16) Study schedule (depends on user and subject)
CREATE TABLE IF NOT EXISTS study_schedule (
  study_schedule_id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status study_status DEFAULT 'pending',
  target_question INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  update_at TIMESTAMPTZ DEFAULT now(),
  user_id INT REFERENCES "user"(user_id),
  subject_id INT REFERENCES subject(subject_id) ON DELETE SET NULL
);

-- 17) User goal (depends on user and subject)
CREATE TABLE IF NOT EXISTS user_goal (
  user_goal_id SERIAL PRIMARY KEY,
  target_score DECIMAL(5,2),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
  subject_id INT REFERENCES subject(subject_id) ON DELETE SET NULL
);

-- 18) Current progress (depends on user and optionally user_goal)
CREATE TABLE IF NOT EXISTS current_progress (
  current_progress_id SERIAL PRIMARY KEY,
  current_progress DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
  user_goal_id INT REFERENCES user_goal(user_goal_id)
);

-- 19) Bank (depends on topic)
CREATE TABLE IF NOT EXISTS bank (
  bank_id SERIAL PRIMARY KEY,
  description VARCHAR(500),
  topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL,
  time_limit INT,
  available BOOLEAN DEFAULT true
);

-- 20) Question (standalone)
CREATE TABLE IF NOT EXISTS question (
  question_id SERIAL PRIMARY KEY,
  question_name VARCHAR(1000),
  question_content VARCHAR(10000),
  embedding vector(1536),
  type_question INT DEFAULT 1,
  source VARCHAR(50),
  available BOOLEAN DEFAULT true
);

-- 21) Answer (depends on question)
CREATE TABLE IF NOT EXISTS answer (
  answer_id SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
  answer_content VARCHAR(10000) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

-- 22) question_bank (depends on question and bank)
CREATE TABLE IF NOT EXISTS question_bank (
  question_id INT NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
  bank_id INT NOT NULL REFERENCES bank(bank_id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, bank_id)
);

-- 23) Exam schedule
CREATE TABLE IF NOT EXISTS exam_schedule (
  exam_schedule_id SERIAL PRIMARY KEY,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 24) Exam (depends on topic and exam_schedule)
CREATE TABLE IF NOT EXISTS exam (
  exam_id SERIAL PRIMARY KEY,
  exam_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  time_limit INT, -- minutes
  topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL,
  exam_schedule_id INT REFERENCES exam_schedule(exam_schedule_id) ON DELETE SET NULL,
  description VARCHAR(200),
  available BOOLEAN DEFAULT true
);

-- user từng làm exam nào, điểm số ra sao
-- 26) history_exam (depends on exam and user)
CREATE TABLE IF NOT EXISTS history_exam (
  history_exam_id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL REFERENCES exam(exam_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  score DECIMAL(4,2),
  time_test  BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 27) history_bank (depends on bank and user)
CREATE TABLE IF NOT EXISTS history_bank (
  history_bank_id SERIAL PRIMARY KEY,
  bank_id INT NOT NULL REFERENCES bank(bank_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  score DECIMAL(4,2),
  time_test  BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28) user_exam_answer (depends on user, exam, history_exam)
CREATE TABLE IF NOT EXISTS user_exam_answer (
  user_exam_answer_id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
  exam_id INT REFERENCES exam(exam_id) ON DELETE CASCADE,
  answer_id INT, -- optional pointer to chosen answer
  user_answer_text TEXT DEFAULT '',
  history_exam_id INT,
  question_id INT,
  CONSTRAINT fk_user_exam_answer_history FOREIGN KEY (history_exam_id) REFERENCES history_exam(history_exam_id) ON DELETE CASCADE
);
-- ALTER TABLE user_exam_answer
-- ADD COLUMN IF NOT EXISTS question_id INT;

-- 29) user_bank_answer (depends on bank, user, answer, history_bank)
CREATE TABLE IF NOT EXISTS user_bank_answer (
  user_bank_answer_id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  bank_id INT REFERENCES bank(bank_id) ON DELETE SET NULL,
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
  answer_id INT REFERENCES answer(answer_id) ON DELETE SET NULL,
  user_answer_text TEXT DEFAULT '',
  question_id INT,
  history_bank_id INT,
  CONSTRAINT fk_user_bank_answer_history FOREIGN KEY (history_bank_id) REFERENCES history_bank(history_bank_id) ON DELETE CASCADE
);

-- 30) question_exam mapping (depends on question and exam)
CREATE TABLE IF NOT EXISTS question_exam (
  question_id INT NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
  exam_id INT NOT NULL REFERENCES exam(exam_id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, exam_id)
);






-- 31) Chat history (depends on user)
CREATE TABLE IF NOT EXISTS chat_history (
  chat_history_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
  is_user BOOLEAN,
  role VARCHAR(20), -- 'user','assistant','system'
  message TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);






-- 32) Image tables (depend on question/answer)
CREATE TABLE IF NOT EXISTS image_question (
  image_question_id SERIAL PRIMARY KEY,
  image_link TEXT,
  question_id INT REFERENCES question(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS image_answer (
  image_answer_id SERIAL PRIMARY KEY,
  image_link TEXT,
  answer_id INT REFERENCES answer(answer_id) ON DELETE CASCADE
);

-- 33) Indexes (created after tables)
CREATE INDEX IF NOT EXISTS idx_topic_subject ON topic(subject_id);
CREATE INDEX IF NOT EXISTS idx_document_topic ON document(topic_id);
CREATE INDEX IF NOT EXISTS idx_document_history_user ON document_history(user_id);
CREATE INDEX IF NOT EXISTS idx_document_history_document ON document_history(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_question ON answer(question_id);
CREATE INDEX IF NOT EXISTS idx_question_exam_exam ON question_exam(exam_id);
CREATE INDEX IF NOT EXISTS idx_bank_topic ON bank(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_goal_user ON user_goal(user_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Optional pgvector ANN index suggestions (create these AFTER you have vectors and tested tuning lists):
-- CREATE INDEX IF NOT EXISTS idx_document_embedding ON document USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_question_embedding ON question USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_chat_history_embedding ON chat_history USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_chunk_embedding ON chunk USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- End of ordered merged schema

CREATE EXTENSION IF NOT EXISTS unaccent;

