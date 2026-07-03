Get-ChildItem -Path src/app/api -Recurse -Filter "route.ts" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content -Path $file
    $text = $content -join "`n"
    
    # Fix: if (!authorized) return response; 
    if ($text -match 'if \(!authorized\) return response;') {
        $text = $text -replace 'if \(!authorized\) return response;', 'if (!authorized) return response as any;'
        $text | Set-Content -Path $file
        Write-Output "Fixed: $file"
    }
}
