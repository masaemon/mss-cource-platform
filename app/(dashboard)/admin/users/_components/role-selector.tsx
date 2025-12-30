'use client';

import { useState, useTransition } from 'react';
import { updateUserRole } from '@/app/_lib/actions/users';

interface RoleSelectorProps {
  userId: string;
  currentRole: 'user' | 'instructor' | 'admin';
  isCurrentUser: boolean;
}

export function RoleSelector({
  userId,
  currentRole,
  isCurrentUser,
}: RoleSelectorProps) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (newRole: 'user' | 'instructor' | 'admin') => {
    if (
      !confirm(
        `このユーザーの役割を「${getRoleLabel(newRole)}」に変更してもよろしいですか？`
      )
    ) {
      return;
    }

    const previousRole = role;
    setRole(newRole);
    setError(null);

    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
      } catch (err) {
        setRole(previousRole);
        const errorMessage =
          err instanceof Error ? err.message : '役割の変更に失敗しました';
        setError(errorMessage);
        alert(errorMessage);
      }
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return '一般ユーザー';
      case 'instructor':
        return '講師';
      case 'admin':
        return '管理者';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isCurrentUser) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
      >
        {getRoleLabel(role)} (自分)
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={role}
        onChange={(e) =>
          handleChange(e.target.value as 'user' | 'instructor' | 'admin')
        }
        disabled={isPending}
        className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="user">一般ユーザー</option>
        <option value="instructor">講師</option>
        <option value="admin">管理者</option>
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
