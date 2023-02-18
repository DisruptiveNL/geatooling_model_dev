if %processor_architecture%==AMD64 goto x64
rem Run x32 installer
C:\Windows\Microsoft.NET\Framework\v4.0.30319\RegAsm.exe "C:\DisruptiveSolutions\Sparx\EAeXchange.dll"
REG IMPORT AddRegDS.reg
@pause
:x64
rem Run x64 installer
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\RegAsm.exe "C:\DisruptiveSolutions\Sparx\EAeXchange.dll"
REG IMPORT AddRegDS.reg
@pause