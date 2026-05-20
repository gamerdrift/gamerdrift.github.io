Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('weblogo.PNG')
$bmp = New-Object System.Drawing.Bitmap($img)
$width = $bmp.Width
$height = $bmp.Height
$black = 0
$total = $width * $height
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -le 16 -and $c.G -le 16 -and $c.B -le 16 -and $c.A -gt 16) {
            $black++
        }
    }
}
Write-Output "width=$width height=$height black=$black total=$total ratio=$([math]::Round($black/$total, 4))"
