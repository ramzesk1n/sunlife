export interface Step {
  id: string;
  title: string;
  description: string;
  stat?: string;
}

export const introText =
  'За 5 лет мы снимали свыше 2000 выписок. Каждая фотография — это история. Каждая — волшебство момента.' as const;

export const steps: Step[] = [
  {
    id: 'step-experience',
    title: 'Опыт 5+ лет',
    description: 'Ваш малыш будет в руках профессионала, спокойного и опытного',
    stat: '5+',
  },
  {
    id: 'step-sessions',
    title: '500+ проведённых сессий',
    description: 'Вы получите уникальные, неповторимые фото, не "шаблонные"',
    stat: '500+',
  },
  {
    id: 'step-processing',
    title: 'Профессиональная обработка за 3 дня',
    description: 'Вы сможете сразу поделиться красивыми фото с родными и друзьями, в соцсетях',
    stat: '3 дня',
  },
  {
    id: 'step-reviews',
    title: 'Отзывы 100+ реальных клиентов',
    description: 'Вы видите "живые" примеры, понимаете, что фотограф действительно хорош',
    stat: '100+',
  },
  {
    id: 'step-pricing',
    title: 'Прозрачная ценовая политика',
    description: 'Вы знаете всё заранее, нет неожиданностей, выбираете пакет под свой бюджет',
  },
] as const;
