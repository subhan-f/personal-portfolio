import { motion } from 'framer-motion';
import { SocialIcons } from '@components/shared/SocialIcons';

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_70%_35%,rgba(13,88,202,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_55%_at_30%_70%,rgba(16,185,129,0.30),transparent_70%)]" />
      <motion.div
        className="relative z-10 px-4 sm:px-8 lg:px-10 py-16 md:py-20 flex flex-col items-center text-center space-y-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <p
          className="font-semibold leading-none text-white text-center select-none whitespace-normal sm:whitespace-nowrap"
          style={{
            fontSize: 'clamp(3rem,5vw,14rem)',
            letterSpacing: '0.02em',
            lineHeight: 0.9,
            textShadow: '0 2px 18px rgba(0,0,0,0.45)',
          }}
        >
          Subhan Farrakh
        </p>
        <div className="h-0.5 w-64 md:w-64 sm:w-32 rounded-full bg-[linear-gradient(90deg,transparent_0%,#0d58cc_20%,#67e8f9_50%,#34d399_80%,transparent_100%)]" />
        <SocialIcons />
        <p className="text-gray-300 italic max-w-xl">
          "Do what you love the BEST, let me automate the REST." 😜
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <a href="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <span aria-hidden="true">·</span>
          <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          <span aria-hidden="true">·</span>
          <a href="https://blog.subhanfarrakh.com" target="_blank" rel="noopener" className="hover:text-gray-300 transition-colors">Blog</a>
        </div>
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Subhan Farrakh. All rights reserved.
        </p>
      </motion.div>
    </footer>
  );
};
