$basePath = "C:\Users\Gokai\Desktop\Backup\codee\teatro-erp\src\app\api"

$files = @(
    "$basePath\attendance\[id]\route.ts",
    "$basePath\classes\[id]\route.ts",
    "$basePath\courses\[id]\route.ts",
    "$basePath\documents\[id]\route.ts",
    "$basePath\enrollments\[id]\route.ts",
    "$basePath\financial\payments\[id]\route.ts",
    "$basePath\students\[id]\route.ts",
    "$basePath\teachers\[id]\route.ts",
    "$basePath\attendance\route.ts",
    "$basePath\classes\route.ts",
    "$basePath\communications\route.ts",
    "$basePath\courses\route.ts",
    "$basePath\dashboard\route.ts",
    "$basePath\documents\route.ts",
    "$basePath\enrollments\route.ts",
    "$basePath\financial\payments\route.ts",
    "$basePath\settings\route.ts"
)

foreach ($file in $files) {
    if (Test-Path -LiteralPath $file) {
        $content = Get-Content -LiteralPath $file -Raw
        if ($content -match 'if \(!authorized\) return response;') {
            $newContent = $content -replace 'if \(!authorized\) return response;', 'if (!authorized) return response as any;'
            Set-Content -LiteralPath $file -Value $newContent -NoNewline
            Write-Output "Fixed: $file"
        } else {
            Write-Output "No match in: $file"
        }
    } else {
        Write-Output "Not found: $file"
    }
}
