export const metadata = {
  title: 'マイアプリ',
  description: '総合アプリランチャー',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
