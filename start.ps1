Write-Host "Checking for the latest release..."

$repoOwner = "malken21"
$repoName = "Discord-VoiceMute-Switch"
$apiUrl = "https://api.github.com/repos/$repoOwner/$repoName/releases/latest"

try {
    # GitHub APIから最新リリースの情報を取得
    $release = Invoke-RestMethod -Uri $apiUrl
    
    # 拡張子が .exe の最初のアセットを特定
    $asset = $release.assets | Where-Object { $_.name -like "*.exe" } | Select-Object -First 1
    
    if ($asset) {
        $downloadUrl = $asset.browser_download_url
        $outputFile = Join-Path $PSScriptRoot $asset.name
        $remoteFontSize = $asset.size

        $shouldDownload = $true

        # ローカルにファイルが存在するかチェック
        if (Test-Path $outputFile) {
            $localFileItem = Get-Item $outputFile
            $localFileSize = $localFileItem.Length

            # [重要] GitHub APIではSHAハッシュ値が直接取得できないため、
            # 代替手段として「ファイルサイズ」の比較で同一性確認を行う。
            # サイズが一致する場合は、すでに最新版であるとみなしてダウンロードをスキップする。
            if ($localFileSize -eq $remoteFontSize) {
                Write-Host "Executable already exists and size matches. Skipping download." -ForegroundColor Green
                $shouldDownload = $false
            }
            else {
                Write-Host "File exists but size mismatches. Updating..." -ForegroundColor Yellow
            }
        }

        # ダウンロードが必要な場合のみ実行
        if ($shouldDownload) {
            Write-Host "Downloading $($asset.name) from $downloadUrl..."
            Invoke-WebRequest -Uri $downloadUrl -OutFile $outputFile
            Write-Host "Download complete: $outputFile" -ForegroundColor Cyan
        }

        # exeを起動
        Write-Host "Starting application: $outputFile" -ForegroundColor Green
        Start-Process -FilePath $outputFile -NoNewWindow -Wait
    }
    else {
        Write-Error "No executable asset found in the latest release."
    }
}
catch {
    Write-Error "Failed to check or download the latest release: $_"
}
