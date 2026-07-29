import Image from 'next/image'

const LOGO_SIZE = 100

export default function MapLogo() {
  return (
    <div className="map-logo">
      <Image
        src="/favicon.png"
        alt="GeoEscuelas"
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        priority
      />
    </div>
  )
}