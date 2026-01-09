# Supabase Database Migration

Run this SQL in your Supabase SQL Editor to set up the database schema for LearnScroll.

## 1. Create Enums

```sql
-- Content types enum
CREATE TYPE content_type AS ENUM ('text', 'video', 'audio', 'simulation');

-- Difficulty levels enum
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
```

## 2. Create Tables

```sql
-- Main content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type content_type NOT NULL DEFAULT 'text',
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty difficulty_level DEFAULT 'beginner',
  estimated_time_seconds INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User likes
CREATE TABLE likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, content_id)
);

-- User bookmarks
CREATE TABLE bookmarks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, content_id)
);
```

## 3. Enable Row Level Security

```sql
-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Content policies (public read)
CREATE POLICY "Content is viewable by everyone" ON content
  FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Likes policies
CREATE POLICY "Users can view their own likes" ON likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Create Profile on User Signup (Trigger)

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 5. Seed Sample Content (Optional)

```sql
-- Sample text content for testing
INSERT INTO content (type, title, description, category, difficulty, estimated_time_seconds, metadata) VALUES
-- STEM
('text', 'The Fibonacci Sequence in Nature', 'Discover how this mathematical pattern appears everywhere', 'stem', 'beginner', 90, '{"body": "The Fibonacci sequence is one of the most fascinating patterns in mathematics. It starts with 0 and 1, and each subsequent number is the sum of the previous two: 0, 1, 1, 2, 3, 5, 8, 13, 21...\n\nWhat makes this sequence truly remarkable is how often it appears in nature. The spiral arrangement of seeds in a sunflower follows Fibonacci numbers. The number of petals on many flowers—lilies have 3, buttercups have 5, delphiniums have 8—all Fibonacci numbers.\n\nEven the spiral of a nautilus shell follows this pattern. The ratio between consecutive Fibonacci numbers approaches the Golden Ratio (approximately 1.618), which appears throughout art, architecture, and nature.\n\nNext time you see a pinecone or a pineapple, count the spirals—you''ll find Fibonacci numbers hiding in plain sight.", "word_count": 130, "reading_time_seconds": 75}'),

('text', 'Why Is the Sky Blue?', 'The physics behind our colorful atmosphere', 'science', 'beginner', 60, '{"body": "When sunlight enters Earth''s atmosphere, it collides with gas molecules. Sunlight contains all colors of the rainbow, but here''s the key: shorter wavelengths (blue and violet) scatter more than longer wavelengths (red and orange).\n\nThis phenomenon is called Rayleigh scattering. Blue light scatters about 10 times more than red light. As sunlight passes through the atmosphere, blue light bounces around in all directions, filling the sky with blue.\n\nBut wait—violet has an even shorter wavelength than blue. Why isn''t the sky violet? Two reasons: the sun emits more blue light than violet, and our eyes are more sensitive to blue.\n\nDuring sunset, sunlight travels through more atmosphere, scattering away most blue light and leaving the warm reds and oranges we love.", "word_count": 125, "reading_time_seconds": 70}'),

-- History
('text', 'The Library of Alexandria', 'The ancient world''s greatest repository of knowledge', 'history', 'beginner', 90, '{"body": "Founded in the 3rd century BCE, the Library of Alexandria was the ancient world''s most ambitious attempt to collect all human knowledge. Located in Egypt, it was part of a larger research institution called the Mouseion.\n\nAt its peak, the library may have held between 400,000 to 700,000 scrolls. Scholars from across the Mediterranean came to study there. The library employed copyists who would duplicate any book that entered Alexandria''s port.\n\nContrary to popular myth, the library wasn''t destroyed in a single catastrophic event. Instead, it declined gradually over centuries due to reduced funding, political instability, and various conflicts.\n\nThe library''s legacy lives on in our modern concept of public libraries and the pursuit of universal knowledge—ideas that seemed radical 2,300 years ago.", "word_count": 130, "reading_time_seconds": 80}'),

-- Technology
('text', 'How Wi-Fi Actually Works', 'The invisible waves connecting your world', 'technology', 'intermediate', 75, '{"body": "Wi-Fi uses radio waves, just like your car radio, but at much higher frequencies—typically 2.4 GHz or 5 GHz. Your router converts internet data into radio signals, and your device''s Wi-Fi adapter converts them back.\n\nThe data is encoded using a technique called modulation. Think of it like Morse code, but incredibly fast—modern Wi-Fi can transmit billions of bits per second.\n\nWi-Fi signals weaken as they pass through walls and floors. 2.4 GHz signals travel farther but are slower and more crowded (microwaves and Bluetooth use this frequency too). 5 GHz is faster but doesn''t penetrate walls as well.\n\nThe latest Wi-Fi 6E adds the 6 GHz band, offering even more speed and less interference—but with an even shorter range.", "word_count": 125, "reading_time_seconds": 70}'),

-- Psychology
('text', 'The Power of the Mere Exposure Effect', 'Why familiarity breeds fondness', 'psychology', 'beginner', 60, '{"body": "Have you ever noticed how a song grows on you after hearing it several times? This is the mere exposure effect—we tend to prefer things simply because we''re familiar with them.\n\nPsychologist Robert Zajonc demonstrated this in the 1960s. He showed participants Chinese characters they couldn''t read. Characters shown more frequently were rated more positively, even though participants couldn''t explain why.\n\nThis effect influences everything from music preferences to who we find attractive. It''s why advertisers repeat messages and why you might prefer the route you always take to work.\n\nThe effect has limits—too much exposure can lead to boredom. But next time you dislike something new, give it a few more chances. Your brain might just need time to warm up.", "word_count": 125, "reading_time_seconds": 65}'),

-- Philosophy
('text', 'The Ship of Theseus Paradox', 'When does something stop being itself?', 'philosophy', 'intermediate', 75, '{"body": "Imagine a ship. Over time, each plank is replaced as it rots. Eventually, every original piece has been swapped out. Is it still the same ship?\n\nNow imagine someone collected all the old planks and built a second ship. Which one is the \"real\" Ship of Theseus?\n\nThis ancient Greek thought experiment challenges our notion of identity. It applies to everything—your body replaces most of its cells every 7-10 years. Are you the same person you were a decade ago?\n\nPhilosophers have proposed various solutions. Some argue identity is about continuity—the gradual replacement maintains identity. Others say identity depends on the pattern or form, not the physical matter.\n\nThere may be no \"correct\" answer, but wrestling with the question reveals how slippery the concept of identity really is.", "word_count": 135, "reading_time_seconds": 80}'),

-- Economics
('text', 'The Surprising Economics of Free', 'When zero is worth more than something', 'economics', 'beginner', 60, '{"body": "In traditional economics, the difference between 1 cent and free should be trivial. But behavioral economics tells a different story.\n\nDan Ariely''s famous experiment offered people a choice: a Lindt truffle for 15 cents or a Hershey''s Kiss for 1 cent. Most chose the truffle. But when both prices dropped by 1 cent—truffle for 14 cents, Kiss for free—most switched to the Kiss.\n\nFree isn''t just a price; it''s an emotional trigger. At zero, we don''t need to weigh costs against benefits. The fear of loss disappears.\n\nCompanies exploit this constantly: \"Buy one, get one free\" outperforms \"Two for half price,\" even though they''re mathematically identical.\n\nUnderstanding the power of free helps explain everything from freemium apps to why we take things we don''t need just because they''re complimentary.", "word_count": 135, "reading_time_seconds": 70}'),

-- Coding
('text', 'Why Programmers Count From Zero', 'The logic behind arrays starting at 0', 'coding', 'beginner', 60, '{"body": "If you''ve touched any programming, you know arrays start at index 0, not 1. It seems counterintuitive, but there''s elegant logic behind it.\n\nEarly computers had limited memory. Index 0 means the first element is at the memory address of the array itself—no offset needed. Index 1 would waste a calculation on every access.\n\nDijkstra, a legendary computer scientist, argued for 0-based indexing mathematically. When describing a range of numbers, 0 ≤ i < N is cleaner than 1 ≤ i ≤ N. No off-by-one errors when calculating lengths.\n\nToday, memory is cheap, but the convention stuck. Languages like MATLAB and Lua use 1-based indexing, but most follow C''s lead with 0.\n\nIt''s a small quirk that separates human counting from computer efficiency.", "word_count": 125, "reading_time_seconds": 65}'),

-- Space
('text', 'The Pale Blue Dot', 'Earth as seen from 4 billion miles away', 'space', 'beginner', 75, '{"body": "In 1990, as Voyager 1 was leaving our solar system, Carl Sagan convinced NASA to turn its camera around for one last look at Earth. The result was a photograph showing Earth as a tiny speck—less than a pixel—suspended in a beam of sunlight.\n\nSagan''s reflection on this image became legendary: \"Look again at that dot. That''s here. That''s home. That''s us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives.\"\n\nThe image, taken from 4 billion miles away, puts our existence into cosmic perspective. Every war, every triumph, every moment of human history happened on that tiny dot.\n\nVoyager 1 is now over 15 billion miles away—the farthest human-made object from Earth—still sending data home.", "word_count": 140, "reading_time_seconds": 80}'),

-- Literature
('text', 'Why We Still Read Shakespeare', 'The timeless relevance of 400-year-old plays', 'literature', 'beginner', 60, '{"body": "Shakespeare wrote over 400 years ago in a language that often confuses modern readers. So why do we keep returning to his work?\n\nFirst, he invented or popularized over 1,700 words we still use: \"lonely,\" \"generous,\" \"assassination,\" \"uncomfortable.\" His phrases—\"break the ice,\" \"wild goose chase,\" \"heart of gold\"—are so embedded in English we forget their origin.\n\nMore importantly, his themes remain relevant. Hamlet explores depression and indecision. Othello examines jealousy and manipulation. Macbeth shows how ambition corrupts.\n\nShakespeare understood human psychology before psychology existed. His characters aren''t heroes or villains—they''re complex, contradictory, recognizably human.\n\nHis work survives not because it''s assigned in schools, but because each generation finds new meaning in his exploration of love, power, mortality, and what it means to be human.", "word_count": 135, "reading_time_seconds": 70}'),

-- Art
('text', 'Why Mona Lisa Is Famous', 'The story behind the world''s most famous painting', 'art', 'beginner', 75, '{"body": "The Mona Lisa wasn''t always the world''s most famous painting. For centuries, it was respected but not exceptional. So what changed?\n\nIn 1911, an Italian handyman named Vincenzo Peruggia stole it from the Louvre. The theft made international headlines. For two years, the empty wall drew more visitors than the painting ever had.\n\nWhen recovered, the Mona Lisa had become a celebrity. The mystery of her smile—was she happy? Sad? Mocking?—captured public imagination.\n\nDa Vinci did innovate technically: the sfumato technique creates soft transitions that make her expression ambiguous. And she was painted without visible brushstrokes, giving her an almost photographic quality revolutionary for 1503.\n\nBut ultimately, the Mona Lisa is famous for being famous—a feedback loop of attention that a theft accidentally created.", "word_count": 130, "reading_time_seconds": 75}'),

-- Global News
('text', 'How the UN Security Council Works', 'The five voices that shape global security', 'news', 'intermediate', 75, '{"body": "The UN Security Council is the only UN body that can authorize military action and impose binding sanctions. It has 15 members, but 5 permanent members hold all the power: the US, UK, France, Russia, and China—the victors of World War II.\n\nEach permanent member has veto power. One \"no\" vote blocks any resolution, regardless of how the other 14 vote. This has paralyzed action on Syria, Ukraine, and many other crises.\n\nThe 10 non-permanent members serve two-year terms and are elected by the General Assembly. They can vote, but cannot veto.\n\nReforms have been proposed for decades—adding new permanent members, limiting veto power—but any change requires approval from all five current permanent members.\n\nThe Council reflects 1945''s power balance, not today''s. India has more people than any permanent member; Germany and Japan have larger economies than most.", "word_count": 145, "reading_time_seconds": 85}');
```

## Setup Complete!

After running these migrations, your Supabase database will be ready for LearnScroll.

**Next steps:**
1. Copy your Supabase URL and anon key from Project Settings > API
2. Create `.env.local` in your learnscroll-app folder with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Run `npm run dev` to start the app
