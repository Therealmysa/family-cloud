
import React from 'react';

interface ObfuscatedEmailProps {
  email: string;
  className?: string;
}

/**
 * ObfuscatedEmail component to protect email addresses from spam harvesters
 * It splits the email into name and domain parts and uses data attributes
 * to reconstruct them with CSS, making it difficult for bots to scrape
 */
const ObfuscatedEmail = ({ email, className = "" }: ObfuscatedEmailProps) => {
  if (!email || !email.includes('@')) {
    return <span className={className}>Invalid Email</span>;
  }

  const [name, domain] = email.split('@');
  
  return (
    <span className={`obfuscated-email ${className}`}>
      <span data-name={name} />
      <span>&#64;</span>
      <span data-domain={domain} />
    </span>
  );
};

export default ObfuscatedEmail;
