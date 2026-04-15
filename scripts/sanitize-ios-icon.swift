#!/usr/bin/env swift

import AppKit
import Foundation

let fallbackBackground = NSColor(
  calibratedRed: 24.0 / 255.0,
  green: 143.0 / 255.0,
  blue: 105.0 / 255.0,
  alpha: 1
)

func fail(_ message: String) -> Never {
  fputs("\(message)\n", stderr)
  exit(1)
}

func normalizedColor(atX x: Int, y: Int, in bitmap: NSBitmapImageRep) -> NSColor {
  guard let color = bitmap.colorAt(x: x, y: y)?.usingColorSpace(.deviceRGB) else {
    return fallbackBackground
  }
  return color
}

func firstPixelIndex(
  in bitmap: NSBitmapImageRep,
  row y: Int,
  minimumAlpha: CGFloat,
  fromLeft: Bool
) -> Int? {
  if fromLeft {
    for x in 0..<bitmap.pixelsWide {
      if normalizedColor(atX: x, y: y, in: bitmap).alphaComponent >= minimumAlpha {
        return x
      }
    }
    return nil
  }

  for x in stride(from: bitmap.pixelsWide - 1, through: 0, by: -1) {
    if normalizedColor(atX: x, y: y, in: bitmap).alphaComponent >= minimumAlpha {
      return x
    }
  }
  return nil
}

func composite(_ foreground: NSColor, over background: NSColor) -> NSColor {
  let fg = foreground.usingColorSpace(.deviceRGB) ?? foreground
  let bg = background.usingColorSpace(.deviceRGB) ?? background
  let alpha = max(0, min(1, fg.alphaComponent))

  return NSColor(
    deviceRed: fg.redComponent * alpha + bg.redComponent * (1 - alpha),
    green: fg.greenComponent * alpha + bg.greenComponent * (1 - alpha),
    blue: fg.blueComponent * alpha + bg.blueComponent * (1 - alpha),
    alpha: 1
  )
}

let arguments = Array(CommandLine.arguments.dropFirst())

guard arguments.count == 2 else {
  fail("Usage: sanitize-ios-icon.swift <source> <destination>")
}

let sourceURL = URL(fileURLWithPath: arguments[0])
let destinationURL = URL(fileURLWithPath: arguments[1])

let sourceData: Data

do {
  sourceData = try Data(contentsOf: sourceURL)
} catch {
  fail("Unable to read icon image at \(sourceURL.path): \(error.localizedDescription)")
}

guard let sourceBitmap = NSBitmapImageRep(data: sourceData) else {
  fail("Unable to read icon image at \(sourceURL.path)")
}

let width = sourceBitmap.pixelsWide
let height = sourceBitmap.pixelsHigh

guard width > 0 && height > 0 else {
  fail("Icon image has invalid dimensions: \(width)x\(height)")
}

guard let outputBitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: width,
  pixelsHigh: height,
  bitsPerSample: 8,
  samplesPerPixel: 3,
  hasAlpha: false,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
) else {
  fail("Unable to create bitmap for \(destinationURL.path)")
}

outputBitmap.size = NSSize(width: width, height: height)

for y in 0..<height {
  let leftVisible = firstPixelIndex(
    in: sourceBitmap,
    row: y,
    minimumAlpha: 0.01,
    fromLeft: true
  ) ?? 0
  let rightVisible = firstPixelIndex(
    in: sourceBitmap,
    row: y,
    minimumAlpha: 0.01,
    fromLeft: false
  ) ?? (width - 1)

  let leftSolid = firstPixelIndex(
    in: sourceBitmap,
    row: y,
    minimumAlpha: 0.95,
    fromLeft: true
  ) ?? leftVisible
  let rightSolid = firstPixelIndex(
    in: sourceBitmap,
    row: y,
    minimumAlpha: 0.95,
    fromLeft: false
  ) ?? rightVisible

  let leftBackground = normalizedColor(atX: leftSolid, y: y, in: sourceBitmap)
  let rightBackground = normalizedColor(atX: rightSolid, y: y, in: sourceBitmap)

  for x in 0..<width {
    let sourceColor = normalizedColor(atX: x, y: y, in: sourceBitmap)
    let background: NSColor

    if x <= leftVisible {
      background = leftBackground
    } else if x >= rightVisible {
      background = rightBackground
    } else {
      background = (x - leftVisible) <= (rightVisible - x)
        ? leftBackground
        : rightBackground
    }

    let flattenedColor = sourceColor.alphaComponent >= 0.999
      ? NSColor(
          deviceRed: sourceColor.redComponent,
          green: sourceColor.greenComponent,
          blue: sourceColor.blueComponent,
          alpha: 1
        )
      : composite(sourceColor, over: background)

    outputBitmap.setColor(flattenedColor, atX: x, y: y)
  }
}

guard let pngData = outputBitmap.representation(
  using: NSBitmapImageRep.FileType.png,
  properties: [:]
) else {
  fail("Unable to encode flattened icon as PNG")
}

try FileManager.default.createDirectory(
  at: destinationURL.deletingLastPathComponent(),
  withIntermediateDirectories: true,
  attributes: nil
)

do {
  try pngData.write(to: destinationURL)
} catch {
  fail("Unable to write flattened icon to \(destinationURL.path): \(error.localizedDescription)")
}

print("Sanitized iOS icon written to \(destinationURL.path)")