import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '电池适航标准智能搜索引擎',
  description: '基于LightRAG与GraphRAG的电池适航标准智能检索系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
