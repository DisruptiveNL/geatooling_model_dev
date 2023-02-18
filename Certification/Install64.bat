rem Run x64 installer
"C:\Program Files (x86)\Windows Kits\10\App Certification Kit"\signtool.exe sign /tr http://sha256timestamp.ws.symantec.com/sha256/timestamp /f "D:\geaframework\Certification\disruptivesolutions2022.pfx" /p "disruptive_2022" /v "D:\xml2fo\geatools\GEATools\GEATools\bin\Release\GEATools.dll"
rem xcopy /s "D:\xml2fo\geatools\GEATools\GEATools\bin\Release\GEATools.dll" "D:\geaframework\Test\GEATools.dll"
"C:\Windows\Microsoft.NET\Framework\v4.0.30319\RegAsm.exe" "D:\geaframework\Test\GEATools.dll" /codebase
@pause