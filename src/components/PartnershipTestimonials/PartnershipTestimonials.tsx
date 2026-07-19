import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const SWIPE_THRESHOLD = 50;

interface Testimonial {
  id: string;
  name: string;
  role: string;
  photo: string;
  text: string;
  position: 'left' | 'right';
}

const testimonials: Testimonial[] = [
  {
    id: 'garaev',
    name: 'ГАРАЕВ РУСЛАН РАЛИФОВИЧ',
    role: 'Главный врач ГКБ№8',
    photo: '/images/garaev_ruslan_ralifovich.webp',
    text: 'Уважаемый Тагир Амирович! Администрация и коллектив ГКБ№8 выражает Вам искреннюю благодарность и глубокую признательность за плодотворную совместную деятельность. Приятно сотрудничать с компанией, которая работает надёжно, оперативно, а главное, в точном соответствии с договорными обязательствами. Желаем Вам и членам Вашего коллектива дальнейших успехов, экономической стабильности, уверенности в завтрашнем дне!',
    position: 'left',
  },
  {
    id: 'yahina',
    name: 'ЯХИНА РОЗА РАДИКОВНА',
    role: 'Руководитель МИАЦ РБ',
    photo: '', // placeholder
    text: 'Чанышеву Тагиру Амировичу, директору Гильдии фотографов «Санлайф». Выражаю благодарность за активное сотрудничество с Медицинским информационно-аналитическим центром Республики Башкортостан. Желаю Вам в дальнейшем успешной созидательной деятельности, новых идей и стремлений, радости и полученных результатов и достижения новых высот, благополучной реализации всех начинаний.',
    position: 'right',
  },
  {
    id: 'karimova',
    name: 'КАРИМОВА СВЕТЛАНА СИРЕНЕВНА',
    role: 'Главный врач С.С. Каримова',
    photo: '/images/karimova_svetlana_sirenevna.webp',
    text: 'Администрация Государственного автономного учреждения здравоохранения Республики Башкортостан санаторий для детей, в том числе для детей с родителями «Дуслык» города Уфа выражает благодарность Чанышеву Тагиру Амировичу за участие в торжественном мероприятии, посвященному 50-летию санатория. Примите искренние пожелания успехов в Вашей профессиональной деятельности, доброго здоровья, счастья и благополучия Вам и Вашим близким.',
    position: 'left',
  },
  {
    id: 'buchman',
    name: 'БУЧМАН ЕВГЕНИЙ ЕФИМОВИЧ',
    role: 'Главный врач ОМПЦ',
    photo: '/images/buchman_evgeniy_efimovich.webp',
    text: 'Администрация ГАУЗ «ОМПЦ» в лице главного врача Бучмана Евгения Ефимовича Выражает благодарность Гильдии фотографов «Санлайф» в лице директора Чанышева Тагира Амировича за участие в проведении капитального ремонта выписной комнаты родильного отделения ГАУЗ «ОМПЦ».',
    position: 'right',
  },
  {
    id: 'sharipov',
    name: 'ШАРИПОВ РАУЛЬ АХНАФОВИЧ',
    role: 'Главный врач ГБУЗ РПЦД РБ',
    photo: '/images/sharipov_raul_ahnafovich.webp',
    text: 'Хотим поблагодарить за эффективную работу и помощь больнице директора Гильдии фотографов «Санлайф» Чанышева Тагира Амировича. Работа Гильдии фотографов «Санлайф» всегда слажена. Во всем проявляется творческий подход и клиентоориентированность.',
    position: 'left',
  },
  {
    id: 'gurova',
    name: 'ГУРОВА ЗУХРА ГЕЛЬМЕШАРИПОВНА',
    role: 'Главный врач ГБУЗ ГКПЦ г.Уфы',
    photo: '/images/gurova_zuhra_gelmesharipovna.webp',
    text: 'Администрация ГБУЗ РБ Городской клинический перинатальный центр г.Уфы в лице главного врача Гуровой Зухры Гельмешариповны выражает искреннюю благодарность и признательность директору Гильдии фотографов «Санлайф» Чанышеву Тагиру Амировичу за успешное и плодотворное сотрудничество. За период совместной работы мы всегда отмечали профессионализм сотрудников Гильдии фотографов, надёжность и добросовестность директора в выполнении поставленных задач, готовность идти навстречу нашим пожеланиям. Уверены, что в дальнейшем наше сотрудничество будет продолжено.',
    position: 'right',
  },
  {
    id: 'mustafin',
    name: 'МУСТАФИН АРТУР ТАГИРОВИЧ',
    role: 'Проректор БГМУ',
    photo: '/images/mustafin_artur_tagirovich.webp',
    text: 'Башкирский государственный медицинский университет выражает особую благодарность Чанышеву Тагиру Амировичу за успешное сотрудничество. За профессиональную фото и видеосъемку и организацию фототерапии, посвященной врачам, работающим в красной зоне, за высокий профессионализм, надёжность и добросовестность в выполнении поставленных задач. Надеемся на дальнейшее плодотворное сотрудничество.',
    position: 'left',
  },
  {
    id: 'bulatov',
    name: 'БУЛАТОВ ШАМИЛЬ ЭНГЕЛЬСОВИЧ',
    role: 'Главный врач РКБ им. Куватова',
    photo: '/images/bulatov_shamil_engelsovich.webp',
    text: 'Выражаем нашу искреннюю благодарность и глубокую признательность за плодотворное сотрудничество. Мы верим в сохранение сложившихся деловых и дружеских отношений и надеемся на дальнейшее взаимовыгодное сотрудничество. Желаем в дальнейшем успешной и созидательной деятельности, новых идей и стремлений, радости от полученных результатов и достижения новых высот, благополучной реализации всех начинаний!',
    position: 'right',
  },
];

function PlaceholderAvatar() {
  return (
    <div className="w-full h-full rounded-full bg-gold-pale flex items-center justify-center">
      <svg className="w-1/2 h-1/2 text-gold-primary/40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const isLeft = testimonial.position === 'left';

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-8 glass rounded-2xl">
      {/* Photo */}
      <div className={`shrink-0 ${isLeft ? 'md:order-1' : 'md:order-2'}`}>
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-gold-primary/20 shadow-gold mx-auto">
          {testimonial.photo ? (
            <img
              src={testimonial.photo}
              alt={testimonial.name}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <PlaceholderAvatar />
          )}
        </div>
        <div className="text-center mt-3">
          <p className="font-display font-light text-gold-primary-80 text-sm sm:text-base uppercase tracking-wider">
            {testimonial.name}
          </p>
          <p className="text-text-muted text-xs sm:text-sm mt-1">
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* Text */}
      <div className={`flex-1 ${isLeft ? 'md:order-2' : 'md:order-1'}`}>
        <p className="text-text-dark text-base sm:text-lg leading-relaxed text-center md:text-left">
          {testimonial.text}
        </p>
      </div>
    </div>
  );
}

export default function PartnershipTestimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => setActiveIndex((prev) => (prev + 1) % testimonials.length), []);
  const prev = useCallback(() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) next();
      else prev();
    }
  }, [next, prev]);

  return (
    <section
      ref={sectionRef}
      id="partnership-testimonials"
      className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cream-2"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-gold-primary-80 text-center mb-4 uppercase tracking-wider"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Отзывы партнёров
        </motion.h2>

        <motion.p
          className="text-text-muted text-center text-base md:text-lg max-w-xl mx-auto mb-10 md:mb-14"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Что говорят о нас руководители медицинских учреждений
        </motion.p>

        {/* Slider */}
        <motion.div
          className="relative"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          {/* Cards container */}
          <div className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((t) => (
                <div key={t.id} className="w-full shrink-0 px-1">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-cream border border-gold-primary/30 text-gold-primary flex items-center justify-center hover:bg-gold-primary hover:text-cream transition-colors"
              aria-label="Предыдущий отзыв"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className="w-8 h-8 shrink-0 flex items-center justify-center"
                  aria-label={`Отзыв ${idx + 1}`}
                >
                  <span
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? 'bg-gold-primary w-6'
                        : 'bg-gold-primary/30 hover:bg-gold-primary/50 w-2'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-cream border border-gold-primary/30 text-gold-primary flex items-center justify-center hover:bg-gold-primary hover:text-cream transition-colors"
              aria-label="Следующий отзыв"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Counter */}
          <p className="text-center text-text-muted text-sm mt-4">
            {activeIndex + 1} / {testimonials.length}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
