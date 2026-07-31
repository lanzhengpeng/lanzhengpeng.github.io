export default function BackLink({ href, children }) {
    return (
        <a href={href} className="back-link" data-no-spa>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {children}
        </a>
    );
}
