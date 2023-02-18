if %processor_architecture%==AMD64 goto x64
rem Run x32 installer
"C:\Program Files (x86)\Windows Kits\8.1\bin\x64"\signtool.exe sign /t http://timestamp.verisign.com/scripts/timstamp.dll /f "C:\DisruptiveSolutions\Sparx\disruptivesolutions2021.pfx" /p "ds2018" /v "C:\DisruptiveSolutions\Sparx\EAeXchange.dll"
C:\Windows\Microsoft.NET\Framework\v4.0.30319\RegAsm.exe "C:\DisruptiveSolutions\Sparx\EAeXchange.dll"
REG IMPORT AddRegDS.reg
@pause
:x64
rem Run x64 installer
"C:\Program Files (x86)\Windows Kits\8.1\bin\x64"\signtool.exe sign /t http://timestamp.verisign.com/scripts/timstamp.dll /f "C:\DisruptiveSolutions\Sparx\disruptivesolutions2021.pfx" /p "ds2018" /v "C:\DisruptiveSolutions\Sparx\EAeXchange.dll"
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\RegAsm.exe "C:\DisruptiveSolutions\Sparx\EAeXchange.dll"
REG IMPORT AddRegDS.reg
@pause