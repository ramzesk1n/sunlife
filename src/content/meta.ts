export interface PageMeta {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

export const siteMeta = {
  siteName: 'фотослужба САН ЛАЙФ',
  baseUrl: 'https://sunlife-ufa.ru',
  defaultOgImage: '/images/og-default.jpg',
} as const;

export const pagesMeta: PageMeta[] = [
  {
    path: '/',
    title: 'Фотография выписки из роддома в Уфе | фотослужба САН ЛАЙФ',
    description:
      'Профессиональная фотосъемка выписки новорожденного в роддомах Уфы, Стерлитамака, Иркутска. От 2000 ₽. Гарантия + результат за 24 часа. 500+ счастливых семей.',
    ogTitle: 'Фотография выписки из роддома в Уфе | фотослужба САН ЛАЙФ',
    ogDescription:
      'Профессиональная фотосъемка выписки новорожденного. От 2000 ₽. Гарантия + результат за 24 часа. 500+ счастливых семей.',
    ogImage: '/images/og-home.jpg',
    canonical: '/',
  },
  {
    path: '/price',
    title: 'Цены на фотосъёмку выписки из роддома | САН ЛАЙФ',
    description:
      'Тарифы на фотосъёмку выписки из роддома в Уфе. 6 пакетов от 750 ₽ до 7500 ₽. Фото, видео, фотокниги, распечатки.',
    ogTitle: 'Цены на фотосъёмку выписки из роддома | САН ЛАЙФ',
    ogDescription:
      '6 пакетов услуг от 750 ₽ до 7500 ₽. Фото, видео, фотокниги, распечатки. Бесплатная доставка по Уфе.',
    ogImage: '/images/og-price.jpg',
    canonical: '/price',
  },
  {
    path: '/galery',
    title: 'Портфолио — фотографии выписки из роддома | САН ЛАЙФ',
    description:
      'Галерея работ фотослужбы САН ЛАЙФ. Выписка из роддома в Уфе, Стерлитамаке, Кумертау. 500+ проведённых сессий.',
    ogTitle: 'Портфолио — фотографии выписки из роддома | САН ЛАЙФ',
    ogDescription:
      'Галерея работ фотослужбы САН ЛАЙФ. Реальные фотографии выписки из роддома.',
    ogImage: '/images/og-gallery.jpg',
    canonical: '/galery',
  },
  {
    path: '/partnership',
    title: 'Партнёрство с роддомами | фотослужба САН ЛАЙФ',
    description:
      'Сотрудничество с роддомами Уфы, Стерлитамака, Кумертау, Салавата, Нижнего Новгорода, Иркутска и Орска. Профессиональная фотосъёмка выписки.',
    ogTitle: 'Партнёрство с роддомами | фотослужба САН ЛАЙФ',
    ogDescription:
      'Сотрудничество с роддомами по всей России. Профессиональная фотосъёмка выписки новорожденных.',
    ogImage: '/images/og-partnership.jpg',
    canonical: '/partnership',
  },
] as const;

export function getMetaByPath(path: string): PageMeta {
  return pagesMeta.find((p) => p.path === path) ?? pagesMeta[0];
}
