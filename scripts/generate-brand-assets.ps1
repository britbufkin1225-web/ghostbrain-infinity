Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$brandDir = Join-Path $root "src/assets/brand"
$iconsDir = Join-Path $root "src/assets/icons"
$studioDir = Join-Path $root "src/assets/studio"
$uiDir = Join-Path $root "src/assets/ui"

New-Item -ItemType Directory -Force -Path $brandDir, $iconsDir, $studioDir, $uiDir | Out-Null

function New-Bitmap($width, $height, [bool]$transparent) {
  $bitmap = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  if ($transparent) {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 5, 6, 8))
  }
  return @($bitmap, $graphics)
}

function New-Brush($hex, $alpha = 255) {
  $r = [Convert]::ToInt32($hex.Substring(1, 2), 16)
  $g = [Convert]::ToInt32($hex.Substring(3, 2), 16)
  $b = [Convert]::ToInt32($hex.Substring(5, 2), 16)
  return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
}

function New-Pen($hex, $width = 1, $alpha = 255) {
  $r = [Convert]::ToInt32($hex.Substring(1, 2), 16)
  $g = [Convert]::ToInt32($hex.Substring(3, 2), 16)
  $b = [Convert]::ToInt32($hex.Substring(5, 2), 16)
  return New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, $r, $g, $b), $width)
}

function Add-RoundedRectPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-GlassBackground($graphics, $width, $height) {
  $rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 11, 13, 16),
    [System.Drawing.Color]::FromArgb(255, 22, 26, 32),
    35
  )
  $graphics.FillRectangle($brush, $rect)
  $brush.Dispose()

  $cyanPen = New-Pen "#77e6ff" 2 46
  $violetPen = New-Pen "#8d7cff" 2 34
  $graphics.DrawArc($cyanPen, -80, -80, 320, 320, 8, 80)
  $graphics.DrawArc($violetPen, $width - 270, -100, 340, 340, 128, 88)
  $cyanPen.Dispose()
  $violetPen.Dispose()
}

function Draw-GhostIcon($graphics, [single]$x, [single]$y, [single]$size, [bool]$watermark) {
  $alpha = if ($watermark) { 48 } else { 255 }
  $bodyBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle($x, $y, $size, $size)),
    [System.Drawing.Color]::FromArgb($alpha, 232, 237, 242),
    [System.Drawing.Color]::FromArgb($alpha, 143, 184, 255),
    90
  )
  $edgePen = New-Pen "#77e6ff" ([Math]::Max(2, $size / 42)) ([Math]::Min($alpha, 180))
  $darkBrush = New-Brush "#050608" ([Math]::Min($alpha, 230))

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddBezier($x + $size * 0.20, $y + $size * 0.43, $x + $size * 0.18, $y + $size * 0.18, $x + $size * 0.42, $y + $size * 0.08, $x + $size * 0.50, $y + $size * 0.18)
  $path.AddBezier($x + $size * 0.50, $y + $size * 0.18, $x + $size * 0.60, $y + $size * 0.02, $x + $size * 0.86, $y + $size * 0.17, $x + $size * 0.81, $y + $size * 0.43)
  $path.AddLine([single]($x + $size * 0.81), [single]($y + $size * 0.43), [single]($x + $size * 0.81), [single]($y + $size * 0.77))
  $path.AddBezier($x + $size * 0.81, $y + $size * 0.77, $x + $size * 0.72, $y + $size * 0.68, $x + $size * 0.64, $y + $size * 0.80, $x + $size * 0.56, $y + $size * 0.72)
  $path.AddBezier($x + $size * 0.56, $y + $size * 0.72, $x + $size * 0.49, $y + $size * 0.84, $x + $size * 0.39, $y + $size * 0.67, $x + $size * 0.31, $y + $size * 0.79)
  $path.AddBezier($x + $size * 0.31, $y + $size * 0.79, $x + $size * 0.23, $y + $size * 0.72, $x + $size * 0.20, $y + $size * 0.79, $x + $size * 0.20, $y + $size * 0.43)
  $path.CloseFigure()
  $graphics.FillPath($bodyBrush, $path)
  $graphics.DrawPath($edgePen, $path)

  $brainPen = New-Pen "#242932" ([Math]::Max(2, $size / 52)) ([Math]::Min($alpha, 180))
  $graphics.DrawArc($brainPen, $x + $size * 0.32, $y + $size * 0.13, $size * 0.22, $size * 0.18, 200, 240)
  $graphics.DrawArc($brainPen, $x + $size * 0.47, $y + $size * 0.12, $size * 0.23, $size * 0.19, 120, 245)
  $graphics.DrawLine($brainPen, [single]($x + $size * 0.50), [single]($y + $size * 0.16), [single]($x + $size * 0.50), [single]($y + $size * 0.34))

  $graphics.FillEllipse($darkBrush, [single]($x + $size * 0.37), [single]($y + $size * 0.41), [single]($size * 0.08), [single]($size * 0.11))
  $graphics.FillEllipse($darkBrush, [single]($x + $size * 0.58), [single]($y + $size * 0.41), [single]($size * 0.08), [single]($size * 0.11))
  $graphics.FillRectangle($darkBrush, [single]($x + $size * 0.45), [single]($y + $size * 0.58), [single]($size * 0.16), [single]($size * 0.035))

  $crownPen = New-Pen "#e8edf2" ([Math]::Max(2, $size / 44)) ([Math]::Min($alpha, 220))
  $crownRect = [System.Drawing.RectangleF]::new(
    [single]($x + $size * 0.38),
    [single]($y + $size * 0.02),
    [single]($size * 0.26),
    [single]($size * 0.11)
  )
  $graphics.DrawArc($crownPen, $crownRect.X, $crownRect.Y, $crownRect.Width * 0.55, $crownRect.Height, 205, 300)
  $graphics.DrawArc($crownPen, $crownRect.X + $crownRect.Width * 0.45, $crownRect.Y, $crownRect.Width * 0.55, $crownRect.Height, 35, 300)

  $bodyBrush.Dispose()
  $edgePen.Dispose()
  $darkBrush.Dispose()
  $brainPen.Dispose()
  $crownPen.Dispose()
  $path.Dispose()
}

function Save-Png($bitmap, $graphics, $path) {
  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Draw-Logo($path, $width, $height, [bool]$transparent, [bool]$wide, [bool]$compact, [bool]$header) {
  $parts = New-Bitmap $width $height $transparent
  $bitmap = $parts[0]
  $graphics = $parts[1]
  if (-not $transparent) { Draw-GlassBackground $graphics $width $height }

  $markSize = if ($compact) { [Math]::Min($height - 26, 92) } else { [Math]::Min($height - 32, 112) }
  Draw-GhostIcon $graphics 24 (($height - $markSize) / 2) $markSize $false

  $titleSize = if ($compact) { 24 } elseif ($wide) { 36 } else { 32 }
  $subSize = if ($header) { 13 } else { 14 }
  $titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", $titleSize, [System.Drawing.FontStyle]::Bold)
  $subFont = New-Object System.Drawing.Font("Consolas", $subSize, [System.Drawing.FontStyle]::Regular)
  $titleBrush = New-Brush "#e8edf2"
  $subBrush = New-Brush "#aeb7c2"
  $x = 44 + $markSize
  if ($compact) {
    $graphics.DrawString("GhostBrain", $titleFont, $titleBrush, $x, $height * 0.24)
    $graphics.DrawString("Infinity", $subFont, $subBrush, $x + 2, $height * 0.58)
  } else {
    $graphics.DrawString("GhostBrain Infinity", $titleFont, $titleBrush, $x, $height * 0.27)
    $subText = if ($header) { "by devdevbuilds" } else { "local-first AI vault dashboard" }
    $graphics.DrawString($subText, $subFont, $subBrush, $x + 3, $height * 0.62)
  }
  $titleFont.Dispose()
  $subFont.Dispose()
  $titleBrush.Dispose()
  $subBrush.Dispose()
  Save-Png $bitmap $graphics $path
}

function Draw-Studio($path, $width, $height, [bool]$transparent, [bool]$footer) {
  $parts = New-Bitmap $width $height $transparent
  $bitmap = $parts[0]
  $graphics = $parts[1]
  if (-not $transparent) { Draw-GlassBackground $graphics $width $height }

  $font = New-Object System.Drawing.Font("Consolas", 22, [System.Drawing.FontStyle]::Bold)
  $smallFont = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Regular)
  $brush = New-Brush "#e8edf2"
  $subBrush = New-Brush "#aeb7c2"
  $pen = New-Pen "#77e6ff" 2 90
  $titleY = if ($footer) { 24 } else { 18 }
  $subY = if ($footer) { 55 } else { 49 }
  $graphics.DrawLine($pen, 18, 22, 18, $height - 22)
  $graphics.DrawString("devdevbuilds", $font, $brush, 34, $titleY)
  $graphics.DrawString("parent studio", $smallFont, $subBrush, 36, $subY)
  $font.Dispose()
  $smallFont.Dispose()
  $brush.Dispose()
  $subBrush.Dispose()
  $pen.Dispose()
  Save-Png $bitmap $graphics $path
}

function Draw-UiReference($path, $width, $height, $kind) {
  $parts = New-Bitmap $width $height $false
  $bitmap = $parts[0]
  $graphics = $parts[1]
  Draw-GlassBackground $graphics $width $height

  $font = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
  $mono = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Regular)
  $titleBrush = New-Brush "#e8edf2"
  $subBrush = New-Brush "#aeb7c2"
  $faceBrush = New-Brush "#161a20" 230
  $chromePen = New-Pen "#e8edf2" 1 54
  $cyanPen = New-Pen "#77e6ff" 2 86
  $panel = Add-RoundedRectPath 28 34 ($width - 56) ($height - 70) 12
  $graphics.FillPath($faceBrush, $panel)
  $graphics.DrawPath($chromePen, $panel)

  if ($kind -eq "button") {
    $button = Add-RoundedRectPath 72 74 ($width - 144) 64 8
    $graphics.FillPath((New-Brush "#242932" 238), $button)
    $graphics.DrawPath($cyanPen, $button)
    $graphics.DrawString("RAISED METAL BUTTON", $mono, $titleBrush, 92, 96)
    $button.Dispose()
  } elseif ($kind -eq "control") {
    foreach ($i in 0..2) {
      $control = Add-RoundedRectPath (54 + ($i * 96)) 82 78 42 8
      $graphics.FillPath((New-Brush "#0b0d10" 238), $control)
      $graphics.DrawPath($chromePen, $control)
      $graphics.DrawString(("0" + ($i + 1)), $mono, $subBrush, (80 + ($i * 96)), 96)
      $control.Dispose()
    }
  } elseif ($kind -eq "surface") {
    for ($i = 0; $i -lt 6; $i++) {
      $linePen = New-Pen "#aeb7c2" 1 (22 + ($i * 6))
      $graphics.DrawLine($linePen, 52, 74 + ($i * 22), $width - 52, 74 + ($i * 22))
      $linePen.Dispose()
    }
  } else {
    $glass = Add-RoundedRectPath 58 76 ($width - 116) 92 10
    $graphics.FillPath((New-Brush "#050608" 168), $glass)
    $graphics.DrawPath($cyanPen, $glass)
    $glass.Dispose()
  }

  $graphics.DrawString($kind.ToUpperInvariant(), $font, $titleBrush, 34, 12)
  $graphics.DrawString("chrome / black glass reference", $mono, $subBrush, 34, $height - 30)
  $font.Dispose()
  $mono.Dispose()
  $titleBrush.Dispose()
  $subBrush.Dispose()
  $faceBrush.Dispose()
  $chromePen.Dispose()
  $cyanPen.Dispose()
  $panel.Dispose()
  Save-Png $bitmap $graphics $path
}

Draw-Logo (Join-Path $brandDir "ghostbrain-infinity-logo-primary.png") 760 220 $false $false $false $false
Draw-Logo (Join-Path $brandDir "ghostbrain-infinity-logo-primary-transparent.png") 760 220 $true $false $false $false
Draw-Logo (Join-Path $brandDir "ghostbrain-infinity-logo-wide.png") 960 240 $false $true $false $false
Draw-Logo (Join-Path $brandDir "ghostbrain-infinity-logo-compact.png") 360 150 $true $false $true $false
Draw-Logo (Join-Path $brandDir "ghostbrain-infinity-header-lockup.png") 760 180 $false $false $false $true
Draw-Logo (Join-Path $brandDir "ghostbrain-infinity-header-lockup-transparent.png") 760 180 $true $false $false $true

$iconAssets = @(
  [pscustomobject]@{ Name = "ghostbrain-icon-primary.png"; Size = 256; Transparent = $false; Watermark = $false },
  [pscustomobject]@{ Name = "ghostbrain-icon-transparent.png"; Size = 256; Transparent = $true; Watermark = $false },
  [pscustomobject]@{ Name = "ghostbrain-icon-small.png"; Size = 96; Transparent = $true; Watermark = $false },
  [pscustomobject]@{ Name = "ghostbrain-icon-watermark.png"; Size = 512; Transparent = $true; Watermark = $true },
  [pscustomobject]@{ Name = "ghostbrain-icon-crowned.png"; Size = 256; Transparent = $true; Watermark = $false }
)

foreach ($asset in $iconAssets) {
  $parts = New-Bitmap $asset.Size $asset.Size $asset.Transparent
  $bitmap = $parts[0]
  $graphics = $parts[1]
  if (-not $asset.Transparent) { Draw-GlassBackground $graphics $asset.Size $asset.Size }
  Draw-GhostIcon $graphics ($asset.Size * 0.12) ($asset.Size * 0.10) ($asset.Size * 0.76) $asset.Watermark
  Save-Png $bitmap $graphics (Join-Path $iconsDir $asset.Name)
}

Draw-Studio (Join-Path $studioDir "devdevbuilds-secondary-mark.png") 360 120 $true $false
Draw-Studio (Join-Path $studioDir "devdevbuilds-footer-mark.png") 360 120 $false $true
Draw-Studio (Join-Path $studioDir "devdevbuilds-small-transparent.png") 260 86 $true $false

Draw-UiReference (Join-Path $uiDir "ui-metal-button-reference.png") 420 220 "button"
Draw-UiReference (Join-Path $uiDir "ui-black-glass-panel-reference.png") 460 260 "glass"
Draw-UiReference (Join-Path $uiDir "ui-embossed-control-reference.png") 420 220 "control"
Draw-UiReference (Join-Path $uiDir "ui-dashboard-surface-reference.png") 640 300 "surface"
