import { ref } from 'vue';

export function useScrollDirection(threshold = 50) {
  const isScrollingDown = ref(false);
  let lastScrollTop = 0;
  let ticking = false;

  const onScroll = (e: { detail?: { scrollTop?: number } }) => {
    const scrollTop = e.detail?.scrollTop ?? 0;

    if (!ticking) {
      ticking = true;
      setTimeout(() => {
        const diff = scrollTop - lastScrollTop;
        if (Math.abs(diff) > threshold) {
          isScrollingDown.value = diff > 0;
          lastScrollTop = scrollTop;
        }
        ticking = false;
      }, 100);
    }
  };

  const reset = () => {
    isScrollingDown.value = false;
    lastScrollTop = 0;
  };

  return { isScrollingDown, onScroll, reset };
}
