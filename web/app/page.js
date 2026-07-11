export default function Home() {
  return (
    <main>
      <h1>Text-To-Video-AI</h1>
      <p>
        Muapi requests go through <code>/api/api/v1/*</code>, which proxies to{' '}
        <code>https://api.muapi.ai/api/v1/*</code> and attaches your API key
        from the <code>x-api-key</code> request header.
      </p>
    </main>
  );
}
