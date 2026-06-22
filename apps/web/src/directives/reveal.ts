import type { Directive } from 'vue';

export const vReveal: Directive<HTMLElement, { delay?: number } | undefined> = {
  beforeMount(el, binding) {
    el.classList.add('reveal');
    if (binding.value?.delay) {
      el.style.setProperty('--reveal-delay', `${binding.value.delay}ms`);
    }
  },
  mounted(el) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal-in');
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
  },
};
