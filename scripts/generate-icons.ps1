# One-off icon generator — gold crescent + star on a dark-green gradient.
Add-Type -AssemblyName System.Drawing

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = 2.0 * $r
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Get-StarPoints([float]$cx, [float]$cy, [float]$outer, [float]$inner) {
  $pts = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  for ($i = 0; $i -lt 10; $i++) {
    $r = if ($i % 2 -eq 0) { $outer } else { $inner }
    $ang = -([Math]::PI / 2.0) + $i * ([Math]::PI / 5.0)
    $x = $cx + $r * [Math]::Cos($ang)
    $y = $cy + $r * [Math]::Sin($ang)
    $pts.Add([System.Drawing.PointF]::new($x, $y))
  }
  return ,$pts
}

function New-Icon([int]$size, [string]$name, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $bgTop = [System.Drawing.Color]::FromArgb(255, 13, 26, 20)
  $bgBottom = [System.Drawing.Color]::FromArgb(255, 20, 83, 45)
  $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $bgTop, $bgBottom, 90.0)
  if ($maskable) {
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
  } else {
    $pad = $size * 0.08
    $rr = $size * 0.22
    $g.FillPath($bgBrush, (New-RoundedPath $pad $pad ($size - 2 * $pad) ($size - 2 * $pad) $rr))
  }
  $glyph = if ($maskable) { 0.72 * $size } else { 0.56 * $size }
  $cx = $size / 2.0
  if ($maskable) { $cy = $size * 0.47 } else { $cy = $size * 0.45 }
  $gold = [System.Drawing.Color]::FromArgb(255, 212, 175, 55)
  $goldBrush = New-Object System.Drawing.SolidBrush($gold)
  $cres = New-Object System.Drawing.Drawing2D.GraphicsPath
  $cres.FillMode = [System.Drawing.Drawing2D.FillMode]::Alternate
  $rOuter = 0.42 * $glyph
  $rInner = 0.36 * $glyph
  $cres.AddEllipse($cx - $rOuter, $cy - $rOuter, 2 * $rOuter, 2 * $rOuter)
  $cres.AddEllipse($cx - $rInner + 0.14 * $glyph, $cy - $rInner - 0.06 * $glyph, 2 * $rInner, 2 * $rInner)
  $g.FillPath($goldBrush, $cres)
  $pts = Get-StarPoints ($cx - 0.05 * $glyph) ($cy + 0.34 * $glyph) (0.30 * $glyph) (0.13 * $glyph)
  $g.FillPolygon($goldBrush, $pts.ToArray())
  $g.Dispose()
  $bmp.Save((Join-Path $PSScriptRoot "..\icons\$name"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot "..\icons") | Out-Null
New-Icon 192 "icon-192.png" $false
New-Icon 512 "icon-512.png" $false
New-Icon 512 "icon-maskable-512.png" $true
Write-Output "Icons written to icons/"