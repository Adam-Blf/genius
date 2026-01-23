-- =====================================================
-- GENIUS PWA - Schema de base de données Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles (utilisateurs)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  xp_total INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  last_activity_date DATE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Génie'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- TABLE: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- RLS pour categories (lecture publique)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Insérer les catégories par défaut
INSERT INTO categories (name, icon_name, color, order_index) VALUES
  ('Histoire', 'scroll', 'from-amber-500 to-orange-600', 1),
  ('Sciences', 'flask', 'from-green-500 to-emerald-600', 2),
  ('Géographie', 'globe', 'from-blue-500 to-cyan-600', 3),
  ('Arts', 'palette', 'from-purple-500 to-pink-600', 4),
  ('Sports', 'trophy', 'from-red-500 to-rose-600', 5),
  ('Divertissement', 'film', 'from-indigo-500 to-violet-600', 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABLE: questions
-- =====================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  explanation TEXT,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_questions_category_difficulty ON questions(category_id, difficulty);

-- RLS pour questions (lecture publique)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

-- =====================================================
-- TABLE: user_progress
-- =====================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  current_lesson INTEGER DEFAULT 1,
  lessons_completed INTEGER[] DEFAULT '{}',
  mastery_level INTEGER DEFAULT 0,
  UNIQUE(user_id, category_id)
);

-- RLS pour user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: leagues
-- =====================================================
CREATE TABLE IF NOT EXISTS leagues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond', 'master')),
  min_xp_weekly INTEGER NOT NULL,
  icon_url TEXT
);

-- RLS pour leagues (lecture publique)
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leagues are viewable by everyone" ON leagues
  FOR SELECT USING (true);

-- Insérer les ligues par défaut
INSERT INTO leagues (name, tier, min_xp_weekly) VALUES
  ('Bronze', 'bronze', 0),
  ('Argent', 'silver', 500),
  ('Or', 'gold', 1500),
  ('Diamant', 'diamond', 3000),
  ('Master', 'master', 5000)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABLE: league_members
-- =====================================================
CREATE TABLE IF NOT EXISTS league_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  weekly_xp INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  rank_position INTEGER,
  UNIQUE(user_id)
);

-- RLS pour league_members
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "League members are viewable by everyone" ON league_members
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own league membership" ON league_members
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: friendships
-- =====================================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- RLS pour friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" ON friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of" ON friendships
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- =====================================================
-- QUESTIONS DE DEMO (Histoire)
-- =====================================================
INSERT INTO questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation, xp_reward)
SELECT
  c.id,
  q.difficulty,
  q.question_text,
  q.correct_answer,
  q.wrong_answers,
  q.explanation,
  q.xp_reward
FROM categories c,
(VALUES
  (2, 'En quelle année a eu lieu la Révolution française ?', '1789', ARRAY['1776', '1804', '1815'], 'La Révolution française a débuté en 1789 avec la prise de la Bastille le 14 juillet.', 10),
  (3, 'Qui était le premier empereur romain ?', 'Auguste', ARRAY['Jules César', 'Néron', 'Caligula'], 'Auguste (né Octave) est devenu le premier empereur romain en 27 av. J.-C.', 15),
  (2, 'Quelle civilisation a construit les pyramides de Gizeh ?', 'Les Égyptiens', ARRAY['Les Mayas', 'Les Romains', 'Les Grecs'], 'Les pyramides de Gizeh ont été construites par les anciens Égyptiens il y a environ 4 500 ans.', 10),
  (3, 'En quelle année Christophe Colomb a-t-il découvert l''Amérique ?', '1492', ARRAY['1498', '1500', '1485'], 'Christophe Colomb a atteint les Amériques le 12 octobre 1492.', 15),
  (4, 'Quel traité a mis fin à la Première Guerre mondiale ?', 'Le traité de Versailles', ARRAY['Le traité de Paris', 'Le traité de Vienne', 'Le traité de Berlin'], 'Le traité de Versailles, signé le 28 juin 1919, a mis fin à la Première Guerre mondiale.', 20),
  (2, 'Qui a peint la Joconde ?', 'Léonard de Vinci', ARRAY['Michel-Ange', 'Raphaël', 'Botticelli'], 'La Joconde a été peinte par Léonard de Vinci entre 1503 et 1519.', 10),
  (3, 'Quelle était la capitale de l''Empire byzantin ?', 'Constantinople', ARRAY['Rome', 'Athènes', 'Alexandrie'], 'Constantinople (aujourd''hui Istanbul) était la capitale de l''Empire byzantin.', 15),
  (4, 'En quelle année a eu lieu la chute du mur de Berlin ?', '1989', ARRAY['1991', '1985', '1987'], 'Le mur de Berlin est tombé le 9 novembre 1989.', 20),
  (2, 'Qui était le roi de France pendant la Révolution ?', 'Louis XVI', ARRAY['Louis XIV', 'Louis XV', 'Napoléon'], 'Louis XVI était roi de France au moment de la Révolution française.', 10),
  (3, 'Quelle guerre a opposé le Nord et le Sud des États-Unis ?', 'La guerre de Sécession', ARRAY['La guerre d''indépendance', 'La guerre de 1812', 'La guerre hispano-américaine'], 'La guerre de Sécession (1861-1865) a opposé les États du Nord aux États confédérés du Sud.', 15)
) AS q(difficulty, question_text, correct_answer, wrong_answers, explanation, xp_reward)
WHERE c.name = 'Histoire';

-- =====================================================
-- QUESTIONS DE DEMO (Sciences)
-- =====================================================
INSERT INTO questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation, xp_reward)
SELECT
  c.id,
  q.difficulty,
  q.question_text,
  q.correct_answer,
  q.wrong_answers,
  q.explanation,
  q.xp_reward
FROM categories c,
(VALUES
  (2, 'Quelle est la formule chimique de l''eau ?', 'H2O', ARRAY['CO2', 'NaCl', 'O2'], 'L''eau est composée de deux atomes d''hydrogène et un atome d''oxygène : H2O.', 10),
  (3, 'Combien de planètes compte le système solaire ?', '8', ARRAY['9', '7', '10'], 'Le système solaire compte 8 planètes depuis que Pluton a été reclassifiée en 2006.', 15),
  (2, 'Quel organe pompe le sang dans le corps humain ?', 'Le cœur', ARRAY['Les poumons', 'Le foie', 'Les reins'], 'Le cœur est l''organe qui pompe le sang à travers tout le corps.', 10),
  (4, 'Quelle est la vitesse de la lumière ?', '300 000 km/s', ARRAY['150 000 km/s', '450 000 km/s', '100 000 km/s'], 'La lumière voyage à environ 299 792 km/s dans le vide.', 20),
  (3, 'Quel scientifique a formulé la théorie de la relativité ?', 'Albert Einstein', ARRAY['Isaac Newton', 'Galilée', 'Stephen Hawking'], 'Albert Einstein a publié sa théorie de la relativité restreinte en 1905.', 15),
  (2, 'Quel gaz les plantes absorbent-elles pour la photosynthèse ?', 'Le dioxyde de carbone', ARRAY['L''oxygène', 'L''azote', 'L''hydrogène'], 'Les plantes absorbent le CO2 et rejettent de l''oxygène pendant la photosynthèse.', 10),
  (3, 'Combien d''os compte le squelette humain adulte ?', '206', ARRAY['186', '226', '256'], 'Le squelette humain adulte est composé de 206 os.', 15),
  (4, 'Quel est l''élément le plus abondant dans l''univers ?', 'L''hydrogène', ARRAY['L''hélium', 'L''oxygène', 'Le carbone'], 'L''hydrogène représente environ 75% de la masse de l''univers visible.', 20)
) AS q(difficulty, question_text, correct_answer, wrong_answers, explanation, xp_reward)
WHERE c.name = 'Sciences';

-- =====================================================
-- QUESTIONS DE DEMO (Géographie)
-- =====================================================
INSERT INTO questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation, xp_reward)
SELECT
  c.id,
  q.difficulty,
  q.question_text,
  q.correct_answer,
  q.wrong_answers,
  q.explanation,
  q.xp_reward
FROM categories c,
(VALUES
  (2, 'Quelle est la capitale de la France ?', 'Paris', ARRAY['Lyon', 'Marseille', 'Bordeaux'], 'Paris est la capitale de la France depuis le Moyen Âge.', 10),
  (2, 'Quel est le plus grand océan du monde ?', 'L''océan Pacifique', ARRAY['L''océan Atlantique', 'L''océan Indien', 'L''océan Arctique'], 'L''océan Pacifique couvre environ 165 millions de km².', 10),
  (3, 'Quel est le plus long fleuve du monde ?', 'Le Nil', ARRAY['L''Amazone', 'Le Mississippi', 'Le Yangtsé'], 'Le Nil mesure environ 6 650 km de long.', 15),
  (3, 'Quelle est la capitale du Japon ?', 'Tokyo', ARRAY['Osaka', 'Kyoto', 'Yokohama'], 'Tokyo est la capitale du Japon depuis 1868.', 15),
  (4, 'Quel pays a le plus grand nombre d''habitants ?', 'L''Inde', ARRAY['La Chine', 'Les États-Unis', 'L''Indonésie'], 'L''Inde a dépassé la Chine en 2023 pour devenir le pays le plus peuplé.', 20),
  (2, 'Sur quel continent se trouve l''Égypte ?', 'L''Afrique', ARRAY['L''Asie', 'L''Europe', 'L''Océanie'], 'L''Égypte est située au nord-est de l''Afrique.', 10),
  (3, 'Quelle est la plus haute montagne du monde ?', 'L''Everest', ARRAY['Le K2', 'Le Mont Blanc', 'Le Kilimandjaro'], 'L''Everest culmine à 8 849 mètres d''altitude.', 15),
  (4, 'Combien de pays font partie de l''Union européenne ?', '27', ARRAY['28', '25', '30'], 'L''UE compte 27 États membres depuis le Brexit en 2020.', 20)
) AS q(difficulty, question_text, correct_answer, wrong_answers, explanation, xp_reward)
WHERE c.name = 'Géographie';

-- =====================================================
-- Fonction pour obtenir le classement des amis
-- =====================================================
CREATE OR REPLACE FUNCTION get_friends_leaderboard(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  xp_total INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.display_name,
    p.avatar_url,
    p.xp_total,
    ROW_NUMBER() OVER (ORDER BY p.xp_total DESC) AS rank
  FROM profiles p
  WHERE p.id = p_user_id
     OR p.id IN (
       SELECT CASE
         WHEN f.requester_id = p_user_id THEN f.addressee_id
         ELSE f.requester_id
       END
       FROM friendships f
       WHERE (f.requester_id = p_user_id OR f.addressee_id = p_user_id)
         AND f.status = 'accepted'
     )
  ORDER BY p.xp_total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Fin du schema
-- =====================================================
