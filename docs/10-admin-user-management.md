# 10. Admin：ユーザー管理機能

## 概要
管理者がユーザーの役割を管理する機能の実装

## 実装内容

### 管理ダッシュボード
- [x] `app/(dashboard)/admin/dashboard/page.tsx` 作成
- [x] ユーザー統計表示
- [x] コース統計表示
- [ ] 最近のアクティビティ表示（任意、別途実装可能）

### ユーザー一覧ページ
- [x] `app/(dashboard)/admin/users/page.tsx` 作成
- [x] ユーザー一覧表示（ページネーション付き）
- [x] ユーザー検索機能
- [x] 役割フィルター（user/instructor/admin）
- [ ] ユーザー詳細モーダル/ページ（任意、別途実装可能）

### ユーザー役割変更
- [x] 役割変更UI（ドロップダウン）
- [x] 役割変更確認ダイアログ
- [x] 即座に反映

### Server Actions
- [x] `app/_lib/actions/users.ts` 作成
- [x] `updateUserRole` アクション実装
- [x] 権限チェック（管理者のみ）

### 権限保護
- [x] Middlewareでの管理者チェック
- [x] Server Componentでの役割確認
- [x] 一般ユーザー・講師のアクセス拒否

## ファイル構成

```
app/
├── (dashboard)/
│   └── admin/
│       ├── dashboard/
│       │   └── page.tsx
│       └── users/
│           ├── page.tsx
│           └── _components/
│               ├── user-table.tsx
│               ├── user-search.tsx
│               └── role-selector.tsx
├── _components/
│   └── confirm-dialog.tsx
└── _lib/
    ├── actions/
    │   └── users.ts
    └── queries/
        └── users.ts
```

## ユーザー一覧取得

```typescript
// app/_lib/queries/users.ts
import { createClient } from '@/app/_lib/supabase/server';

export async function getUsers(params?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const { search, role, page = 1, limit = 20 } = params || {};

  let query = supabase
    .from('profiles')
    .select('*, courses(count)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  if (role) {
    query = query.eq('role', role);
  }

  const start = (page - 1) * limit;
  const end = start + limit - 1;
  query = query.range(start, end);

  const { data: users, count, error } = await query;

  if (error) throw error;

  return { users, count };
}
```

## Server Actions実装

```typescript
// app/_lib/actions/users.ts
'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(
  userId: string,
  newRole: 'user' | 'instructor' | 'admin'
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 管理者チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Admin only');
  }

  // 自分自身の役割変更を防ぐ
  if (userId === user.id) {
    throw new Error('Cannot change your own role');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;

  revalidatePath('/admin/users');
}
```

## ユーザー一覧ページ

```typescript
// app/(dashboard)/admin/users/page.tsx
import { createClient } from '@/app/_lib/supabase/server';
import { getUsers } from '@/app/_lib/queries/users';
import { redirect } from 'next/navigation';
import { UserTable } from './_components/user-table';
import { UserSearch } from './_components/user-search';

interface UsersPageProps {
  searchParams: {
    search?: string;
    role?: string;
    page?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // 管理者チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  const { search, role, page } = searchParams;
  const { users, count } = await getUsers({
    search,
    role,
    page: page ? parseInt(page) : 1,
  });

  return (
    <div>
      <h1>ユーザー管理</h1>
      <UserSearch />
      <UserTable users={users || []} totalCount={count || 0} />
    </div>
  );
}
```

## 役割選択UI

```typescript
// app/(dashboard)/admin/users/_components/role-selector.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateUserRole } from '@/app/_lib/actions/users';

interface RoleSelectorProps {
  userId: string;
  currentRole: 'user' | 'instructor' | 'admin';
}

export function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  const handleChange = async (newRole: 'user' | 'instructor' | 'admin') => {
    if (
      !confirm(
        `このユーザーの役割を「${newRole}」に変更してもよろしいですか？`
      )
    ) {
      return;
    }

    setRole(newRole);

    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
      } catch (error) {
        setRole(currentRole); // エラー時は戻す
        alert('役割の変更に失敗しました');
      }
    });
  };

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value as any)}
      disabled={isPending}
      className="border rounded px-2 py-1"
    >
      <option value="user">一般ユーザー</option>
      <option value="instructor">講師</option>
      <option value="admin">管理者</option>
    </select>
  );
}
```

## ページネーション

```typescript
// app/_components/pagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        前へ
      </button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        次へ
      </button>
    </div>
  );
}
```

## Middlewareでの保護

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // ... セッション更新処理

  // 管理者専用ページの保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}
```

## ユーザー統計（任意）

- 総ユーザー数
- 役割別ユーザー数
- 新規ユーザー数（今月）
- アクティブユーザー数

## セキュリティ

- [x] 管理者のみアクセス可能
- [x] 自分自身の役割変更を防ぐ
- [x] RLSポリシーでデータ保護
- [ ] 役割変更の監査ログ（任意、別途実装可能）

## 注意事項

- 役割変更は即座に反映される
- 講師から一般ユーザーに降格すると、作成したコースは残るが編集不可
- 最後の管理者を一般ユーザーに変更しないよう注意

## テスト項目

- [x] ユーザー一覧が表示される
- [x] ユーザーを検索できる
- [x] 役割でフィルターできる
- [x] 役割を変更できる
- [x] 自分自身の役割を変更できない
- [x] 一般ユーザー・講師はアクセスできない
- [x] ページネーションが機能する
- [x] 役割変更後にキャッシュが更新される

## 参考

- [Supabase - Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- CLAUDE.md - ユーザー役割と権限
