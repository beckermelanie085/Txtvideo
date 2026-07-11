export const metadata = {
  title: 'Text-To-Video-AI',
  description: 'Web frontend for the Text-To-Video-AI generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
