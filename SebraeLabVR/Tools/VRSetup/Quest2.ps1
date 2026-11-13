param(
 [ValidateSet('Install','Validate','Build','Devices','Open','Check')][string]$Action='Check',
 [string]$EditorPath=$env:UNITY_EDITOR_PATH
)
$ErrorActionPreference='Stop'
$projectPath=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$versionFile=Join-Path $projectPath 'ProjectSettings\ProjectVersion.txt'
$versionText=Get-Content -LiteralPath $versionFile -Raw
$version=[regex]::Match($versionText,'m_EditorVersion: (\S+)').Groups[1].Value
if($version -ne '6000.0.83f1'){throw 'A versao deste pacote nao corresponde ao instalador preparado.'}
$unityCli=Join-Path $env:LOCALAPPDATA 'Unity\bin\unity.exe'
$candidates=@($EditorPath)
if($env:ProgramFiles){$candidates+=Join-Path $env:ProgramFiles "Unity\Hub\Editor\$version\Editor\Unity.exe"}
$candidates+=Join-Path $env:LOCALAPPDATA "Unity\Hub\Editor\$version\Editor\Unity.exe"
$editor=$candidates | Where-Object {$_ -and (Test-Path -LiteralPath $_ -PathType Leaf)} | Select-Object -First 1
if($Action -eq 'Check'){
 [pscustomobject]@{Project=$projectPath;RequiredEditor=$version;EditorFound=$editor;CliInstalled=(Test-Path -LiteralPath $unityCli);SceneExists=(Test-Path -LiteralPath (Join-Path $projectPath 'Assets\Scenes\Sebrae.unity'))} | Format-List
 return
}
if($Action -eq 'Install'){
 if($editor){
  $android=Join-Path (Split-Path $editor -Parent) 'Data\PlaybackEngines\AndroidPlayer'
  if((Test-Path (Join-Path $android 'SDK\platform-tools\adb.exe')) -and (Test-Path (Join-Path $android 'OpenJDK\bin\java.exe')) -and (Test-Path (Join-Path $android 'NDK\source.properties'))){Write-Output 'Editor e ferramentas Android encontrados. A validacao sera executada na etapa seguinte.';return}
 }
 if(-not (Test-Path -LiteralPath $unityCli)){
  $previousSkipSetup=$env:UNITY_CLI_SKIP_SETUP
  try{
   $env:UNITY_CLI_SKIP_SETUP='1'
   & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'install-unity-cli.ps1')
   if($LASTEXITCODE -ne 0){throw 'Nao foi possivel instalar a Unity CLI. Instale o editor pelo Unity Hub conforme LEIA-ME-OUTRA-MAQUINA.txt.'}
  }finally{$env:UNITY_CLI_SKIP_SETUP=$previousSkipSetup}
 }
 & $unityCli install $version --changeset dacc44548933 --module android --child-modules --yes --accept-eula --resume
 if($LASTEXITCODE -ne 0){throw 'Instalacao nao concluida. Consulte o erro acima e a autorizacao de administrador do Windows.'}
 return
}
if(-not $editor){throw 'Editor 6000.0.83f1 nao encontrado. Instale pelo Hub ou informe -EditorPath com o caminho completo de Unity.exe.'}
if($Action -eq 'Open'){
 Start-Process -FilePath $editor -ArgumentList ('-projectPath "'+$projectPath+'"')
 return
}
$android=Join-Path (Split-Path $editor -Parent) 'Data\PlaybackEngines\AndroidPlayer'
if($Action -eq 'Devices'){
 $adb=Join-Path $android 'SDK\platform-tools\adb.exe'
 if(-not (Test-Path -LiteralPath $adb)){throw 'Android SDK ausente. Adicione os modulos Android pelo Hub.'}
 & $adb devices -l
 if($LASTEXITCODE -ne 0){throw 'ADB retornou erro.'}
 return
}
if(Test-Path -LiteralPath (Join-Path $projectPath 'Temp\UnityLockfile')){throw 'Feche o projeto no Unity antes de validar ou gerar o APK.'}
$method=if($Action -eq 'Build'){'SebraeLab.Editor.Quest2Build.Build'}else{'SebraeLab.Editor.Quest2Build.Validate'}
$log=Join-Path $PSScriptRoot ('unity-'+$Action.ToLower()+'.log')
$argsText='-batchmode -nographics -quit -projectPath "'+$projectPath+'" -buildTarget Android -executeMethod '+$method+' -logFile "'+$log+'"'
$process=Start-Process -FilePath $editor -ArgumentList $argsText -WindowStyle Hidden -Wait -PassThru
if($process.ExitCode -ne 0){throw "Unity retornou erro $($process.ExitCode). Consulte $log"}
$marker=if($Action -eq 'Build'){'QUEST2_APK_BUILT:'}else{'QUEST2_EDITOR_VALIDATION_OK'}
if(-not (Test-Path -LiteralPath $log)){throw 'O Unity nao produziu o log esperado. Confira a instalacao/licenca.'}
if(-not (Select-String -LiteralPath $log -Pattern $marker -SimpleMatch -Quiet)){throw "A conclusao nao foi confirmada pelo Unity. Consulte $log"}
if($Action -eq 'Build'){
 $apk=Join-Path $projectPath 'Builds\Quest2\SebraeLabVR-Quest2.apk'
 if(-not (Test-Path -LiteralPath $apk)){throw 'APK nao encontrado apos a compilacao.'}
 Write-Output "APK gerado: $apk"
}else{Write-Output 'Importacao e execucao da validacao confirmadas no editor. Teste no aparelho ainda pendente.'}
