$FileName = "trayrun.exe"
$DownloadUrl = "https://github.com/misohena/trayrun/releases/download/1.0.0/trayrun.exe"

# 現在のディレクトリにファイルが存在するか確認
if (-not (Test-Path -Path $FileName)) {
    # ファイルをダウンロード
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $FileName
}

./trayrun.exe /c "start.bat" /title "Background Discord-VoiceMute-Switch"