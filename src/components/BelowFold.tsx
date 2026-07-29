import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/gsap'

import Difference from './sections/Difference'
import Craft from './sections/Craft'
import Marquee from './sections/Marquee'
import Products from './sections/Products'
import Science from './sections/Science'
import Benefits from './sections/Benefits'
import Lifestyle from './sections/Lifestyle'
import Testimonials from './sections/Testimonials'
import WhyChoose from './sections/WhyChoose'
import About from './sections/About'
import CTA from './sections/CTA'

/**
 * Every section below the hero, in one lazily-loaded chunk.
 *
 * None of this is on screen at first paint, but bundling it with the hero meant
 * the browser had to download, parse and execute all of it before React could
 * render anything — which is what LCP was actually waiting on. Splitting it out
 * lets the hero paint on a much smaller bundle; this chunk then streams in
 * behind it, well before a user can scroll to it.
 *
 * Order is unchanged from the original single-file App.
 */
export default function BelowFold() {
  // This chunk resolves asynchronously, so it can land after App's own refresh
  // has already run. Re-measure once the sections are actually in the DOM, or
  // every ScrollTrigger below the hero binds to stale offsets.
  //
  // One refresh on mount is not enough: the pinned sections (Science, Benefits)
  // measure their start/end against the current document height, and that height
  // keeps changing after mount as the webfont swaps in (headings reflow) and as
  // section images decode. A pin measured against the pre-swap layout starts at
  // a stale scroll position and visibly overlaps the section above it until the
  // browser's own load-event refresh finally corrects it. So we refresh again at
  // each moment the layout can shift: after mount, once fonts are ready, once all
  // images/resources have loaded, and after in-view images inside this subtree
  // finish decoding.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()

    const raf = requestAnimationFrame(refresh)
    const timers = [setTimeout(refresh, 400), setTimeout(refresh, 1200)]

    document.fonts?.ready.then(refresh).catch(() => {})

    if (document.readyState === 'complete') refresh()
    else window.addEventListener('load', refresh)

    // Any image that decodes after mount changes the height above a pinned
    // section; refresh once each one lands (capture phase catches them all).
    const onImgLoad = (e: Event) => {
      if ((e.target as HTMLElement)?.tagName === 'IMG') refresh()
    }
    document.addEventListener('load', onImgLoad, true)

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener('load', refresh)
      document.removeEventListener('load', onImgLoad, true)
    }
  }, [])

  return (
    <>
      <Difference />
      <Craft />
      <Marquee />
      <About />
      <Products />
      <Science />
      <Benefits />
      <Lifestyle />
      <Testimonials />
      <WhyChoose />
      <CTA />
    </>
  )
}
