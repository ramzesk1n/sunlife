import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SVG_URL = '/images/russia-map.svg?v=2026-07-20';

const pxToRem = (px: number) => `${px / 16}rem`;

const CITY_LABELS: Record<string, string> = {
  ufa: 'Уфа - Республика Башкортостан',
  sterlitamak: 'Стерлитамак - Республика Башкортостан',
  kumertau: 'Кумертау - Республика Башкортостан',
  salavat: 'Салават - Республика Башкортостан',
  'nizhny-novgorod': 'Нижний Новгород - Нижегородская область',
  irkutsk: 'Иркутск - Иркутская область',
  orsk: 'Орск - Оренбургская область',
  syktyvkar: 'Сыктывкар - Республика Коми',
};

interface TooltipState {
  visible: boolean;
  text: string;
  left: string;
  top: string;
}

export default function RussiaMap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    text: '',
    left: '0',
    top: '0',
  });

  const activeCityRef = useRef<string | null>(null);
  const activeRegionRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSvg = async () => {
      try {
        const response = await fetch(SVG_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('SVG load failed');
        const svgText = await response.text();

        setSvgHtml(svgText);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setHasError(true);
        setIsLoading(false);
        // eslint-disable-next-line no-console
        console.error('Map error:', err);
      }
    };

    loadSvg();

    return () => {
      controller.abort();
    };
  }, []);

  const setupSvg = useCallback((svg: SVGSVGElement) => {
    svgRef.current = svg;
    svg.setAttribute('width', '100%');
    svg.removeAttribute('height');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Карта городов работы фотослужбы САН ЛАЙФ');
  }, []);

  const showTooltip = useCallback((dotEl: Element, city: string) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const dotRect = dotEl.getBoundingClientRect();

    const tooltipWidth = 12.5 * 16;
    const tooltipHeight = 2.5 * 16;

    let left = dotRect.left - wrapperRect.left + dotRect.width / 2;
    let top = dotRect.top - wrapperRect.top - tooltipHeight - 8;

    left = Math.max(8, Math.min(left - tooltipWidth / 2, wrapperRect.width - tooltipWidth - 8));
    if (top < 0) {
      top = dotRect.bottom - wrapperRect.top + 8;
    }

    setTooltip({
      visible: true,
      text: CITY_LABELS[city] || city,
      left: pxToRem(left),
      top: pxToRem(top),
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const highlightRegion = useCallback((svg: SVGSVGElement, region: string | undefined) => {
    svg.querySelectorAll('.map-region').forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-region') === region);
    });
  }, []);

  const resetHighlight = useCallback((svg: SVGSVGElement) => {
    svg.querySelectorAll('.map-region.is-active').forEach((el) => {
      if (el.getAttribute('data-region') !== activeRegionRef.current) {
        el.classList.remove('is-active');
      }
    });
  }, []);

  const resetAll = useCallback((clearTooltip = true) => {
    activeCityRef.current = null;
    activeRegionRef.current = null;
    const svg = svgRef.current;
    if (svg) {
      svg.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
    }
    if (clearTooltip) hideTooltip();
  }, [hideTooltip]);

  const initInteractivity = useCallback((svg: SVGSVGElement) => {
    const handlers = new WeakMap<Element, { enter: () => void; leave: () => void; click: (e: Event) => void; keydown: (e: Event) => void }>();

    svg.querySelectorAll('.map-city-dot').forEach((dot) => {
      const onMouseEnter = () => {
        const city = dot.getAttribute('data-city') || '';
        const region = dot.getAttribute('data-region') || '';
        if (activeCityRef.current === city) return;
        highlightRegion(svg, region);
        showTooltip(dot, city);
      };

      const onMouseLeave = () => {
        if (activeCityRef.current) return;
        resetHighlight(svg);
        hideTooltip();
      };

      const onClick = (e: Event) => {
        e.stopPropagation();
        const city = dot.getAttribute('data-city') || '';
        const region = dot.getAttribute('data-region') || '';

        if (activeCityRef.current === city) {
          resetAll();
        } else {
          resetAll(false);
          activeCityRef.current = city;
          activeRegionRef.current = region;
          dot.classList.add('is-active');
          highlightRegion(svg, region);
          showTooltip(dot, city);
        }
      };

      const onKeyDown = (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      };

      handlers.set(dot, { enter: onMouseEnter, leave: onMouseLeave, click: onClick, keydown: onKeyDown });

      dot.addEventListener('mouseenter', onMouseEnter);
      dot.addEventListener('mouseleave', onMouseLeave);
      dot.addEventListener('click', onClick);
      dot.addEventListener('keydown', onKeyDown);
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', CITY_LABELS[dot.getAttribute('data-city') || ''] || dot.getAttribute('data-city') || '');
    });

    const onSvgClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.map-city-dot')) {
        resetAll();
      }
    };

    svg.addEventListener('click', onSvgClick);

    return () => {
      svg.querySelectorAll('.map-city-dot').forEach((dot) => {
        const h = handlers.get(dot);
        if (!h) return;
        dot.removeEventListener('mouseenter', h.enter);
        dot.removeEventListener('mouseleave', h.leave);
        dot.removeEventListener('click', h.click);
        dot.removeEventListener('keydown', h.keydown);
      });
      svg.removeEventListener('click', onSvgClick);
    };
  }, [highlightRegion, showTooltip, resetHighlight, hideTooltip, resetAll]);

  const bindInteractivity = useCallback(() => {
    if (!wrapperRef.current) return undefined;
    const svg = wrapperRef.current.querySelector('svg');
    if (!svg) return undefined;
    setupSvg(svg);
    const cleanup = initInteractivity(svg);
    setIsLoading(false);
    return cleanup;
  }, [setupSvg, initInteractivity]);

  useEffect(() => {
    if (!svgHtml) return undefined;
    const cleanup = bindInteractivity();
    return cleanup;
  }, [svgHtml, bindInteractivity]);

  const svgHtmlMemo = useMemo(() => ({ __html: svgHtml }), [svgHtml]);

  return (
    <div className="relative w-full max-w-[62.5rem] mx-auto">
      <div
        ref={wrapperRef}
        className={`w-full overflow-hidden rounded-xl transition-colors ${
          isLoading ? 'min-h-[18rem] bg-gold-lighter/50 flex items-center justify-center' : ''
        } ${hasError ? 'min-h-[18rem] bg-cream-2 flex items-center justify-center' : ''}`}
        dangerouslySetInnerHTML={svgHtmlMemo}
      />

      {isLoading && !svgHtml && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-text-muted text-sm font-display uppercase tracking-wider">
            Загрузка карты…
          </span>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-text-muted text-sm font-display uppercase tracking-wider">
            Не удалось загрузить карту
          </span>
        </div>
      )}

      <div
        className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-gold-primary/30 bg-white/90 px-3 py-1.5 text-sm text-text-dark shadow-card backdrop-blur-sm transition-all duration-200 ${
          tooltip.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
        style={{
          left: tooltip.left,
          top: tooltip.top,
        }}
        aria-hidden={!tooltip.visible}
      >
        {tooltip.text}
      </div>
    </div>
  );
}
