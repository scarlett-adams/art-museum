/**
 * Starts a new unlimited round. `/unlimited` is a route handler that
 * redirects to a random artwork, so this is a plain link: a full page load,
 * never prefetched.
 */
export default function NewRoundLink(props: Omit<React.ComponentProps<"a">, "href">) {
  // eslint-disable-next-line @next/next/no-html-link-for-pages -- see above
  return <a href="/unlimited" {...props} />;
}
