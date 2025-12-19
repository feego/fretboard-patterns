import * as styles from "./SocialLinks.css";

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="currentColor"
  >
    <path d="M12 2C6.477 2 2 6.563 2 12.193c0 4.5 2.865 8.317 6.839 9.664.5.096.682-.222.682-.49 0-.242-.009-.883-.014-1.733-2.782.62-3.369-1.376-3.369-1.376-.454-1.176-1.11-1.49-1.11-1.49-.908-.64.069-.627.069-.627 1.004.073 1.532 1.055 1.532 1.055.892 1.56 2.341 1.11 2.91.85.092-.66.349-1.11.635-1.365-2.221-.262-4.555-1.138-4.555-5.06 0-1.117.39-2.03 1.03-2.747-.103-.263-.447-1.321.098-2.754 0 0 .84-.275 2.75 1.05A9.21 9.21 0 0 1 12 6.98c.82.004 1.646.114 2.418.333 1.909-1.325 2.748-1.05 2.748-1.05.546 1.433.202 2.491.1 2.754.64.717 1.028 1.63 1.028 2.747 0 3.932-2.338 4.794-4.566 5.05.359.317.678.94.678 1.893 0 1.366-.012 2.468-.012 2.805 0 .27.18.59.688.489C19.138 20.507 22 16.69 22 12.193 22 6.563 17.523 2 12 2z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <path d="M16 11.37a4 4 0 1 1-7.75 1.17 4 4 0 0 1 7.75-1.17z" />
    <path d="M17.5 6.5h.01" />
  </svg>
);

export default function SocialLinks() {
  return (
    <div className={styles.container}>
      <a
        className={styles.link}
        href="https://github.com/feego/fretboard-patterns"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="GitHub"
        title="GitHub"
      >
        <GitHubIcon className={styles.icon} />
      </a>
      <a
        className={styles.link}
        href="https://www.instagram.com/figo.oficial/"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Instagram"
        title="Instagram"
      >
        <InstagramIcon className={styles.icon} />
      </a>
    </div>
  );
}
