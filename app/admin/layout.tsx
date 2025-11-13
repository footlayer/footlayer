import { ReactNode } from 'react';

// Public admin layout (no sidebar) — only /admin/login should use this.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}


