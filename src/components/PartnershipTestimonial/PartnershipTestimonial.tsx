import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const minzdravImages = [
  '/images/image_minzdrav_1.webp',
  '/images/image_minzdrav_2.webp',
  '/images/image_minzdrav_3.webp',
  '/images/image_minzdrav_4.webp',
  '/images/image_minzdrav_5.webp',
  '/images/image_minzdrav_6.webp',
  '/images/image_minzdrav_7.webp',
  '/images/image_minzdrav_8.webp',
  '/images/image_minzdrav_9.webp',
];

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
    text: 'Уважаемый Тагир Амирович! Администрация и коллектив ГКБ№8 выражает Вам искреннюю благодарность и глубокую признательность за плодотворную совместную деятельность. Приятно сотрудничать с компанией, которая работает надёжно, оперативно, а главное, в точном соответствии с договорными обязательствами.',
    position: 'left',
  },
  {
    id: 'yahina',
    name: 'ЯХИНА РОЗА РАДИКОВНА',
    role: 'Руководитель МИАЦ РБ',
    photo: '/images/yakhina_roza_radikovna.webp',
    text: 'Чанышеву Тагиру Амировичу, директору Гильдии фотографов «Санлайф». Выражаю благодарность за активное сотрудничество с Медицинским информационно-аналитическим центром Республики Башкортостан. Желаю Вам в дальнейшем успешной созидательной деятельности.',
    position: 'right',
  },
  {
    id: 'karimova',
    name: 'КАРИМОВА СВЕТЛАНА СИРЕНЕВНА',
    role: 'Главный врач санатория «Дуслык»',
    photo: '/images/karimova_svetlana_sirenevna.webp',
    text: 'Администрация ГАУЗ «Дуслык» выражает благодарность Чанышеву Тагиру Амировичу за участие в торжественном мероприятии, посвященному 50-летию санатория. Примите искренние пожелания успехов в Вашей профессиональной деятельности.',
    position: 'left',
  },
  {
    id: 'buchman',
    name: 'БУЧМАН ЕВГЕНИЙ ЕФИМОВИЧ',
    role: 'Главный врач ОМПЦ',
    photo: '/images/buchman_evgeniy_efimovich.webp',
    text: 'Администрация ГАУЗ «ОМПЦ» в лице главного врача Бучмана Евгения Ефимовича Выражает благодарность Гильдии фотографов «Санлайф» в лице директора Чанышева Тагира Амировича за участие в проведении капитального ремонта выписной комнаты родильного отделения.',
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
    text: 'Администрация ГБУЗ РБ Городской клинический перинатальный центр г.Уфы выражает искреннюю благодарность директору Гильдии фотографов «Санлайф» Чанышеву Тагиру Амировичу за успешное и плодотворное сотрудничество.',
    position: 'right',
  },
  {
    id: 'mustafin',
    name: 'МУСТАФИН АРТУР ТАГИРОВИЧ',
    role: 'Проректор БГМУ',
    photo: '/images/mustafin_artur_tagirovich.webp',
    text: 'Башкирский государственный медицинский университет выражает особую благодарность Чанышеву Тагиру Амировичу за успешное сотрудничество. За профессиональную фото и видеосъемку и организацию фототерапии, посвященной врачам, работающим в красной зоне.',
    position: 'left',
  },
  {
    id: 'bulatov',
    name: 'БУЛАТОВ ШАМИЛЬ ЭНГЕЛЬСОВИЧ',
    role: 'Главный врач РКБ им. Куватова',
    photo: '/images/bulatov_shamil_engelsovich.webp',
    text: 'Выражаем нашу искреннюю благодарность и глубокую признательность за плодотворное сотрудничество. Мы верим в сохранение сложившихся деловых и дружеских отношений и надеемся на дальнейшее взаимовыгодное сотрудничество.',
    position: 'right',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const isLeft = testimonial.position === 'left';

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-8 glass rounded-2xl">
      <div className={`shrink-0 ${isLeft ? 'md:order-1' : 'md:order-2'}`}>
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-gold-primary/20 shadow-gold mx-auto">
          <img
            src={testimonial.photo}
            alt={testimonial.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
        <div className="text-center mt-3">
          <p className="font-display font-light text-gold-primary-80 text-xs sm:text-sm uppercase tracking-wider">
            {testimonial.name}
          </p>
          <p className="text-text-muted text-xs mt-1">
            {testimonial.role}
          </p>
        </div>
      </div>

      <div className={`flex-1 ${isLeft ? 'md:order-2' : 'md:order-1'}`}>
        <p className="text-text-dark text-base leading-relaxed text-center md:text-left">
          {testimonial.text}
        </p>
      </div>
    </div>
  );
}

export default function PartnershipTestimonial() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section
      ref={sectionRef}
      id="partnership-testimonial"
      className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cream-2"
    >
      <div className="max-w-5xl mx-auto">
        {/* Minister */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-gold-primary/20 shadow-gold mb-6">
            <img
              src="/images/Rahmatullin_Airat_Razifovich.webp"
              alt="Рахматуллин Айрат Разифович"
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </div>

          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-light text-gold-primary-80 uppercase tracking-wider text-center mb-2">
            Рахматуллин Айрат Разифович
          </h3>

          <p className="text-text-muted text-base sm:text-lg text-center max-w-xl">
            Министр здравоохранения Республики Башкортостан
          </p>
        </motion.div>

        {/* Minister Quote */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          <blockquote className="text-gold-dark text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-6">
            Примите нашу искреннюю признательность за успешное сотрудничество и высокий профессионализм в совместной работе! От всей души желаем успехов, новых свершений, надёжных партнёров, здоровья и благополучия!
          </blockquote>

          <p className="text-text-muted text-base sm:text-lg">
            С уважением, министр здравоохранения РБ
          </p>
          <p className="text-gold-primary font-display font-light text-base sm:text-lg uppercase tracking-wider">
            А.Р. Рахматуллин
          </p>
        </motion.div>

        {/* Photo Grid - belongs to minister section */}
        <motion.div
          className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-12 md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          {minzdravImages.map((src, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden"
            >
              <img
                src={src}
                alt={`Фото с мероприятия ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-gold-primary/20 pt-12 md:pt-16 mb-10 md:mb-14">
          <h3 className="font-display text-2xl md:text-3xl font-light text-gold-primary-80 text-center uppercase tracking-wider">
            Отзывы партнёров
          </h3>
          <p className="text-text-muted text-center text-base mt-2">
            Что говорят о нас руководители медицинских учреждений
          </p>
        </div>

        {/* Testimonials Slider */}
        <motion.div
          className="relative"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
        >
          <div className="overflow-hidden">
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

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? 'bg-gold-primary w-6'
                      : 'bg-gold-primary/30 hover:bg-gold-primary/50 w-2'
                  }`}
                  aria-label={`Отзыв ${idx + 1}`}
                />
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

          <p className="text-center text-text-muted text-sm mt-4">
            {activeIndex + 1} / {testimonials.length}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
