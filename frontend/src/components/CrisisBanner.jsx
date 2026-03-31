import { motion } from 'framer-motion';

export default function CrisisBanner({ onDismiss }) {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 40%, #6d28d9 100%)',
    color: '#ffffff',
    padding: '16px 20px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
  };

  const innerStyle = {
    maxWidth: '640px',
    margin: '0 auto',
  };

  const headingStyle = {
    margin: '0 0 8px 0',
    fontSize: '15px',
    fontWeight: 700,
    opacity: 0.95,
  };

  const messageStyle = {
    margin: '0 0 12px 0',
    fontSize: '15px',
    lineHeight: 1.5,
    opacity: 0.98,
  };

  const helplinesStyle = {
    margin: '0 0 14px 0',
    padding: 0,
    listStyle: 'none',
    fontSize: '14px',
    lineHeight: 1.6,
  };

  const buttonRowStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '4px',
  };

  const dismissStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#5b21b6',
    background: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  return (
    <motion.div
      className="crisis-banner"
      role="alert"
      initial={{ y: -140, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      style={containerStyle}
    >
      <div className="crisis-banner-inner" style={innerStyle}>
        <h2 className="crisis-banner-heading" style={headingStyle}>
          You are not alone
        </h2>
        <p className="crisis-banner-message" style={messageStyle}>
          It sounds like you are carrying something very heavy. A real person is
          ready to listen.
        </p>
        <ul className="crisis-banner-helplines" style={helplinesStyle}>
          <li>
            <strong>iCall:</strong>{' '}
            <a
              href="tel:9152987821"
              style={{ color: '#ffffff', textDecoration: 'underline' }}
            >
              9152987821
            </a>
          </li>
          <li>
            <strong>Vandrevala Foundation:</strong>{' '}
            <a
              href="tel:18602662345"
              style={{ color: '#ffffff', textDecoration: 'underline' }}
            >
              1860-2662-345
            </a>
          </li>
        </ul>
        <div className="crisis-banner-actions" style={buttonRowStyle}>
          <button
            type="button"
            className="crisis-banner-dismiss"
            style={dismissStyle}
            onClick={() => onDismiss?.()}
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}
