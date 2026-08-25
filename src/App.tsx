import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { useSeo } from './lib/useSeo'

import SmoothScroll from './components/SmoothScroll'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Botanicals from './components/Botanicals'

import Hero from './components/sections/Hero'

// Everything under the fold ships as its own chunk so the hero — the LCP
// element — is not stuck behind parsing and executing the whole page.
const BelowFold = lazy(() => import('./components/BelowFold'))
const Footer = lazy(() => import('./components/sections/Footer'))

function App() {
  const [ready, setReady] = useState(false)
  // Stable identity — Preloader holds this across its rAF sweep.
  const handleIntroDone = useCallback(() => setReady(true), [])

  useSeo({
    title: 'HPLC-Verified Research Peptides | Jupyter Labs',
    description:
      'Research-grade peptides HPLC-verified for purity, traceable to the lot, and documented to the milligram.',
    path: '/',
  })

  // The below-fold chunk mounts after the hero paints, so ScrollTrigger has to
  // re-measure once that content is in the DOM — otherwise every scroll-linked
  // animation past the hero is pinned to stale offsets.
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => ScrollTrigger.refresh(), 200)
    return () => clearTimeout(id)
  }, [ready])

  return (
    <>
      <Preloader onDone={handleIntroDone} />
      <SmoothScroll />
      <Cursor />
      <ScrollProgress />
      <Botanicals />
      <Navbar />

      <main id="main-content" className="relative z-10">
        <Hero />
        <Suspense fallback={null}>
          <BelowFold />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}

export default App
