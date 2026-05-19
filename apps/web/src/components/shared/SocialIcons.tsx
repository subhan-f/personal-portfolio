import { FiGithub, FiLinkedin } from "react-icons/fi";
import { FaXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { glowVariants } from '@lib/animations';
import type { LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';

export const FiverrIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="transparent"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15.352 3c0-.471 0-.707-.147-.854C15.06 2 14.823 2 14.352 2h-2.735C8.896 2 6.522 4.51 6.681 8.5H5c-.471 0-.707 0-.854.146C4 8.793 4 9.03 4 9.5V11c0 .471 0 .707.146.854C4.293 12 4.53 12 5 12h2v9c0 .471 0 .707.146.854C7.293 22 7.53 22 8 22h2c.471 0 .707 0 .854-.146C11 21.707 11 21.47 11 21v-9h4.53v9c0 .471 0 .707.147.854c.146.146.382.146.854.146H19c.471 0 .707 0 .854-.146C20 21.707 20 21.47 20 21V10.5c0-.943 0-1.414-.293-1.707S18.943 8.5 18 8.5h-7V7.23c0-.73.5-1.73 1.797-1.73h1.555c.471 0 .707 0 .853-.146c.147-.147.147-.383.147-.854z"
    />
  </svg>
);

interface SocialLink {
  Icon: LucideIcon | IconType;
  label: string;
  href: string;
}

export const socialLinks: SocialLink[] = [
  {
    Icon: FiLinkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/subhanf',
  },
  {
    Icon: FiverrIcon,
    label: 'Fiverr',
    href: 'https://www.fiverr.com/subhan_codes',
  },
  { Icon: FiGithub, label: 'GitHub', href: 'https://github.com/subhan-f' },
  { Icon: FaXTwitter, label: 'X', href: 'https://x.com/SubhanFarrakh' },
];

export const SocialIcons = ({ className }: { className?: string }) => (
  <div className={`flex gap-5 text-2xl md:text-3xl ${className}`}>
    {socialLinks.map(({ Icon, label, href }) => (
      <motion.a
        key={label}
        href={href}
        target="_blank"
        rel="ugc noopener noreferrer"
        aria-label={label}
        variants={glowVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="text-gray-300 transition-colors duration-200"
      >
        <Icon className="w-6 h-6 md:w-8 md:h-8" />
      </motion.a>
    ))}
  </div>
);
