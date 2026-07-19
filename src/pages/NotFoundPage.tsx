import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <main className="min-h-[70vh] bg-cream flex items-center justify-center px-4 pt-32 pb-16">
      <div className="text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-8xl md:text-9xl font-light text-gold-primary/20 mb-4">
            404
          </h1>
          <h2 className="font-display text-2xl md:text-3xl font-light text-gold-primary-80 uppercase tracking-wider mb-6">
            Страница не найдена
          </h2>
          <p className="text-text-muted text-base md:text-lg mb-8 leading-relaxed">
            Кажется, вы перешли по несуществующей ссылке. Возможно, страница была удалена или адрес изменился.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-gold-dark text-cream font-display uppercase tracking-wider rounded-2xl hover:bg-gold-darker transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            На главную
          </Link>
          <Link
            to="/contacts"
            className="inline-flex items-center justify-center px-8 py-4 border border-gold-primary text-gold-dark font-display uppercase tracking-wider rounded-2xl hover:bg-gold-dark hover:text-cream transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Связаться
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gold-primary/10"
        >
          <p className="text-text-muted text-sm">
            Или посмотрите наши{' '}
            <Link to="/galery" className="text-gold-dark hover:underline">работы</Link>
            {' '}или{' '}
            <Link to="/price" className="text-gold-dark hover:underline">цены</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
