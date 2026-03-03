import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  // Get the layout from page component if available
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(<Component {...pageProps} />);
}
