$files = Get-ChildItem -Path src/app/api -Recurse -Filter "*.ts"
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content -match 'if \(!authorized\) return response;') {
        $content = $content -replace 'if \(!authorized\) return response;', 'if (!authorized) return response as any;'
        Set-Content -Path $file.FullName -Value $content
        Write-Output "Fixed: $($file.FullName)"
    }
}
