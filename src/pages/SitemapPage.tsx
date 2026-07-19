import { Link } from 'react-router-dom';
import InlineCta from '../components/InlineCta/InlineCta';

const mainPages = [
  {
    to: '/',
    title: 'Главная',
    description: 'Фотосъёмка выписки из роддома в Уфе: преимущества, этапы работы, отзывы и ответы на частые вопросы.',
  },
  {
    to: '/price',
    title: 'Цены',
    description: 'Тарифы и пакеты услуг: фото, видео, фотокниги и распечатки — от 750 ₽ до 7500 ₽.',
  },
  {
    to: '/galery',
    title: 'Портфолио',
    description: 'Галерея работ фотослужбы: реальные фотографии выписки из роддомов Уфы и других городов.',
  },
  {
    to: '/partnership',
    title: 'Партнёрство',
    description: 'Сотрудничество с роддомами и клиниками: условия, преимущества и примеры совместной работы.',
  },
  {
    to: '/contacts',
    title: 'Контакты',
    description: 'Телефон, email, мессенджеры и форма заявки — свяжитесь с нами удобным способом.',
  },
];

const infoPages = [
  {
    to: '/privacy',
    title: 'Политика конфиденциальности',
    description: 'Порядок обработки и защиты персональных данных пользователей сайта.',
  },
  {
    to: '/terms',
    title: 'Пользовательское соглашение',
    description: 'Условия использования сайта и оказания услуг фотослужбы САН ЛАЙФ.',
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-cream py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold-dark hover:text-gold-primary transition-colors text-sm font-display uppercase tracking-wider"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            На главную
          </Link>
        </div>

        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-gold-primary-80 uppercase tracking-wider mb-6">
          Карта сайта
        </h1>

        <p className="text-text-muted text-base md:text-lg mb-10">
          Все страницы сайта фотослужбы САН ЛАЙФ в одном месте.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl md:text-2xl text-gold-dark uppercase tracking-wider mb-4">
              Основные страницы
            </h2>
            <ul className="space-y-4">
              {mainPages.map((page) => (
                <li key={page.to}>
                  <Link
                    to={page.to}
                    className="font-display text-lg text-gold-dark hover:text-gold-primary uppercase tracking-wider transition-colors"
                  >
                    {page.title}
                  </Link>
                  <p className="text-text-muted text-base mt-1">{page.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-gold-dark uppercase tracking-wider mb-4">
              Информация и документы
            </h2>
            <ul className="space-y-4">
              {infoPages.map((page) => (
                <li key={page.to}>
                  <Link
                    to={page.to}
                    className="font-display text-lg text-gold-dark hover:text-gold-primary uppercase tracking-wider transition-colors"
                  >
                    {page.title}
                  </Link>
                  <p className="text-text-muted text-base mt-1">{page.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12">
          <InlineCta
            page="privacy"
            title="Вернуться на главную"
            subtitle="Узнайте больше о фотослужбе «Санлайф» и забронируйте съёмку"
          />
        </div>
      </div>
    </div>
  );
}
