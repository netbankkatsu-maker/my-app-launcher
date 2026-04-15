export const metadata = {
  title: 'マイアプリ',
  description: '総合アプリランチャー',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
