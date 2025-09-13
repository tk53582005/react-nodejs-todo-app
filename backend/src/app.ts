import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { closePool } from './db';
import todoRoutes from './routes/todo';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import { verifyToken } from './jwt';

// 型をインポートする
import type { Request, Response } from 'express';

// .envファイルを読み込む
dotenv.config();

// 環境変数からポート番号を取得する
const port = Number(process.env.PORT) || 3000;

// Webサーバーの土台を作成する
const app = express();

// CORSの設定を行う
app.use(cors({
 origin: 'http://localhost:5173',  // 許可するオリジン
 methods: ['GET', 'POST', 'PUT', 'DELETE'],  // 許可するHTTPメソッド
 credentials: true  // 認証情報の送信を許可する
}));

// JSON形式のリクエストボディを解析するミドルウェアを追加する
app.use(express.json());

// クッキーを解析するミドルウェアを追加する
app.use(cookieParser());

// ToDoのCRUD機能を担当する各ルートを読み込む
app.use('/api/todos', verifyToken, todoRoutes);

// 認証機能を担当する各ルートを読み込む
app.use('/api/auth', authRoutes);

// 定義したルート以外へのアクセスに対する処理（404 Not Found）
app.use((req: Request, res: Response) => {
 res.status(404).set('Content-Type', 'text/html; charset=utf-8');
 res.send('<h1>ページが見つかりませんでした。</h1>');
});

// アプリ終了時にDB接続プールを安全に破棄する
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n${signal}を受信。アプリケーションの終了処理中...`);
    await closePool();
    process.exit();
  });
});

// Webサーバーを指定したポートで起動する
app.listen(port, () => {
 console.log(`Webサーバーが起動しました。`);
});