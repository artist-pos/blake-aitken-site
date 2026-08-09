// Stands in for next/image when components are bundled outside Next.
// Mirrors the two layout modes the site actually uses: `fill` (absolutely
// positioned, covering the nearest positioned ancestor) and intrinsic w/h.
import * as React from 'react'

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> {
  src: string
  alt?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  quality?: number
  unoptimized?: boolean
  placeholder?: string
  blurDataURL?: string
}

export default function Image({
  src,
  alt = '',
  fill,
  width,
  height,
  sizes,
  priority: _priority,
  quality: _quality,
  unoptimized: _unoptimized,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  style,
  ...rest
}: ImageProps) {
  const resolved: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
    : style ?? {}

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      style={resolved}
      {...rest}
    />
  )
}
