/**
 * シンプルなメモリベースのRate Limiter
 *
 * 注意: この実装は開発環境や小規模アプリケーション用です。
 * 本番環境では以下の使用を推奨：
 * - Upstash Redis (@upstash/ratelimit)
 * - Vercel Edge Config
 * - Redis / Memcached
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// 定期的にストアをクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60000); // 1分ごと

export interface RateLimitConfig {
  /**
   * 許可するリクエスト数
   */
  maxRequests: number;

  /**
   * 時間ウィンドウ（秒）
   */
  windowSeconds: number;

  /**
   * 識別子（ユーザーID、IPアドレスなど）
   */
  identifier: string;
}

export interface RateLimitResult {
  /**
   * リクエストが許可されたか
   */
  allowed: boolean;

  /**
   * 残りのリクエスト数
   */
  remaining: number;

  /**
   * リセットまでの秒数
   */
  resetInSeconds: number;
}

/**
 * Rate limitをチェック
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowSeconds, identifier } = config;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const key = `${identifier}:${Math.floor(now / windowMs)}`;

  if (!store[key]) {
    store[key] = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  const entry = store[key];

  // 既に制限を超えている場合
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  // カウントを増やす
  entry.count++;

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Rate limitエラーメッセージを生成
 */
export function getRateLimitErrorMessage(result: RateLimitResult): string {
  return `リクエスト制限に達しました。${result.resetInSeconds}秒後に再試行してください。`;
}

/**
 * Rate limitをリセット（テスト用）
 */
export function resetRateLimit(identifier: string): void {
  Object.keys(store).forEach((key) => {
    if (key.startsWith(identifier)) {
      delete store[key];
    }
  });
}
