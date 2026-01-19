-- Todoテーブルの作成
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- updated_atを自動更新するためのトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定（既存を削除して再作成）
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE
    ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データの投入（すべて未完了）
INSERT INTO todos (title, completed) VALUES
    ('サンプル: 買い物リストを作成する', FALSE),
    ('サンプル: タスクを完了にしてみる', FALSE),
    ('サンプル: 期限をカレンダーに登録する', FALSE);
