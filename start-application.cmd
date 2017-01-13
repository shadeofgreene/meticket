start cmd /k call C:\CodeNodeTest\meticket\start-application\1-start-server.bat 4444
timeout /t 1
start cmd /k call C:\CodeNodeTest\meticket\start-application\2-mongod.bat 5555
timeout /t 1
start cmd /k call C:\CodeNodeTest\meticket\start-application\3-mongo.bat 6666