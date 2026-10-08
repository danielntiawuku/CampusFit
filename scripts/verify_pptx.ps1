# verify_pptx.ps1 - fit check for the defence deck.
#
# Opens CampusFit_Project_Defence.pptx read-only in PowerPoint, measures every
# text shape's rendered height (TextRange.BoundHeight) against its shape box,
# flags shapes that spill outside the slide, and exports PNG previews to
# verify/pptx/. Exits 1 when any overflow is found.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify_pptx.ps1
$ErrorActionPreference = 'Stop'

$target = (Resolve-Path (Join-Path (Join-Path $PSScriptRoot '..') 'CampusFit_Project_Defence.pptx')).Path
$outDir = Join-Path (Join-Path (Join-Path $PSScriptRoot '..') 'verify') 'pptx'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$pp = New-Object -ComObject PowerPoint.Application
$issues = @()
try {
    $pres = $pp.Presentations.Open($target, $true, $false, $false)  # ReadOnly, no window
    Write-Output ('slides: ' + $pres.Slides.Count)
    $sw = $pres.PageSetup.SlideWidth
    $sh = $pres.PageSetup.SlideHeight
    foreach ($slide in $pres.Slides) {
        foreach ($shape in $slide.Shapes) {
            if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
                $need = $shape.TextFrame.TextRange.BoundHeight +
                        $shape.TextFrame.MarginTop + $shape.TextFrame.MarginBottom
                if ($need -gt ($shape.Height + 1.5)) {   # +1.5pt tolerance
                    $issues += ('OVERFLOW slide {0}: "{1}" needs {2:N0}pt, box is {3:N0}pt' -f
                        $slide.SlideIndex, $shape.Name, $need, $shape.Height)
                }
            }
            if ($shape.Left -lt -1 -or $shape.Top -lt -1 -or
                ($shape.Left + $shape.Width) -gt ($sw + 1) -or
                ($shape.Top + $shape.Height) -gt ($sh + 1)) {
                $issues += ('OUT-OF-BOUNDS slide {0}: "{1}"' -f $slide.SlideIndex, $shape.Name)
            }
        }
    }
    for ($i = 1; $i -le $pres.Slides.Count; $i++) {
        $png = Join-Path $outDir ('slide_{0:D2}.png' -f $i)
        $pres.Slides.Item($i).Export($png, 'PNG', 1600, 900)
    }
    Write-Output ('exported PNGs -> ' + $outDir)
    if ($issues.Count -eq 0) {
        Write-Output 'TEXT FIT: OK - no overflow, no out-of-bounds shapes'
    } else {
        $issues | ForEach-Object { Write-Output $_ }
        $pres.Close()
        exit 1
    }
    $pres.Close()
} finally {
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($pp) | Out-Null
}
