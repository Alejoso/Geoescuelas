'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/map/Map'), { ssr: false })

export default function HomePage() {
  return (
    <main style={{ height: '100vh', width: '100%' }}>
      <Map />
    </main>
  )
}