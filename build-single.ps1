# בונה את הקובץ היחיד לשליחה בוואטסאפ / להעלאה לרב מסר.
# שלב 1: ייצוא נקי - מסיר את מצב העריכה ומשאיר את העריכות שנשמרו.
# שלב 2: הטמעת כל התמונות בתוך הקובץ (PDF לא מוטמע - דפדפנים חוסמים data: PDF).

$ErrorActionPreference = 'Stop'
$dir    = $PSScriptRoot
$skill  = "$env:USERPROFILE\.claude\skills\page-edit-mode\scripts\export_page.py"
$clean  = Join-Path $env:TEMP 'sarah-clean.html'
$out    = Join-Path $dir 'דף נחיתה לשרה - קובץ יחיד.html'

python $skill (Join-Path $dir 'index.html') --out $clean

$html = [IO.File]::ReadAllText($clean, [Text.Encoding]::UTF8)

Get-ChildItem (Join-Path $dir 'assets') -File |
  Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|gif|svg|webp)$' } |
  ForEach-Object {
    $token = 'assets/' + $_.Name
    if ($html.Contains($token)) {
      $mime = switch ($_.Extension.ToLower()) {
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.gif'  { 'image/gif' }
        '.svg'  { 'image/svg+xml' }
        '.webp' { 'image/webp' }
      }
      $b64  = [Convert]::ToBase64String([IO.File]::ReadAllBytes($_.FullName))
      $html = $html.Replace($token, "data:$mime;base64,$b64")
    }
  }

[IO.File]::WriteAllText($out, $html, (New-Object Text.UTF8Encoding($false)))
Remove-Item $clean -Force

$editorLeft = ($html -match 'pe-fab') -or ($html -match '__pageEditInit')
"assets refs left : $(([regex]::Matches($html,'assets/')).Count)"
"editor artifacts : $editorLeft"
"size             : $([math]::Round((Get-Item $out).Length/1MB,2)) MB"
